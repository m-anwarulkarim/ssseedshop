import { useQuery } from "@tanstack/react-query";
import { fetchFreeGiftConfig, EMPTY_FREE_GIFT_CONFIG } from "@/lib/freeGiftOffer";

export function useFreeGiftOffer() {
  const { data } = useQuery({
    queryKey: ["free-gift-offer"],
    queryFn: fetchFreeGiftConfig,
    staleTime: 60_000,
  });
  return data || EMPTY_FREE_GIFT_CONFIG;
}
