import { useQuery } from "@tanstack/react-query";
import { API_BASE } from "@/lib/apiConfig";

export interface Category {
  id: string | number;
  name: string;
  display_name?: string;
  description?: string;
  position?: number;
  image?: string;
  created_at?: string;
  [key: string]: any;
}

export interface Product {
  id: string | number;
  slug?: string;
  name: string;
  price?: number;
  regular_price?: number;
  offer_price?: number | null;
  product_image?: string | null;
  wholesale_price?: number;
  farmer_price?: number;
  description?: string;
  short_description?: string;
  category?: string;
  categories?: string[];
  image_url?: string;
  images?: string[];
  stock?: number;
  available_stock?: number;
  in_stock?: boolean;
  is_hidden?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  position?: number;
  created_at?: string;
  sku?: string;
  tags?: any[];
  [key: string]: any;
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["public-categories"],
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/categories/get.php`);
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      return (data || []).sort(
        (a: any, b: any) =>
          (a.position || 0) - (b.position || 0) ||
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    },
  });
}

export function useAllProducts() {
  return useQuery<Product[]>({
    queryKey: ["all-products"],
    staleTime: 3 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/products/get.php`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      return (data || [])
        .filter((p: any) => !p.is_hidden)
        .sort(
          (a: any, b: any) =>
            (a.position || 0) - (b.position || 0) ||
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    },
  });
}
