import os
import zipfile

def build_safe_backend_zip(output_path="backend_api.zip", api_dir="api"):
    if os.path.exists(output_path):
        os.remove(output_path)
    
    # Exclude files and folders that contain LIVE DATA or credentials
    EXCLUDED_FILES = {
        ".env",
        ".env.local",
        ".env.production",
        "ssseedshop_db_offline",
    }
    
    EXCLUDED_DIRS = {
        ".git",
        "node_modules",
        "uploads",          # Live uploaded media
        "backup",           # Live backups
    }

    # In database/, only include .sql files and .htaccess, NEVER user data .json files!
    def should_include(rel_path):
        parts = rel_path.replace("\\", "/").split("/")
        filename = parts[-1]
        
        # Check excluded dirs
        for d in parts[:-1]:
            if d in EXCLUDED_DIRS:
                return False
        
        # Check excluded files
        if filename in EXCLUDED_FILES:
            return False
        
        # Protect live database json files - NEVER overwrite live data!
        if len(parts) >= 2 and parts[0] == "database":
            if filename.endswith(".json"):
                return False
        
        return True

    included_files = []
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, api_dir)
                
                if should_include(rel_path):
                    z.write(full_path, rel_path)
                    included_files.append(rel_path)

    size = os.path.getsize(output_path)
    print(f"Safe zip created: {output_path} ({size} bytes, {len(included_files)} files)")
    return included_files

if __name__ == "__main__":
    build_safe_backend_zip()
