import { useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <SEOHead title="পেজ পাওয়া যায়নি — 404" description="আপনি যে পেজটি খুঁজছেন সেটি পাওয়া যায়নি — Ss Seed Shop" />
      <h1 className="text-7xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-2">Page Not Found</p>
      <p className="text-sm text-muted-foreground mb-6">
        The page <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;
