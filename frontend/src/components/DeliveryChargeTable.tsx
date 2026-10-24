import { Truck } from "lucide-react";

export default function DeliveryChargeTable() {
  return (
    <div className="rounded-xl overflow-hidden border border-primary/20 my-2 text-xs">
      <div className="bg-primary/10 px-3 py-2 flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary" />
        <span className="font-bold text-primary">ডেলিভারি চার্জ</span>
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <span className="text-muted-foreground">সকল অর্ডারে</span>
        <span className="font-bold text-foreground">৳৪৯</span>
      </div>
    </div>
  );
}
