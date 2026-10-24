import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Bell } from "lucide-react";
import OrderNotifications from "./OrderNotifications";
import SmsLogs from "./SmsLogs";

export default function Notifications() {
  const { t } = useLanguage();
  return (
    <Tabs defaultValue="orders" className="space-y-4">
      <TabsList>
        <TabsTrigger value="orders" className="gap-1.5">
          <Bell className="w-4 h-4" />
          {t("অর্ডার স্ট্যাটাস", "Order Status")}
        </TabsTrigger>
        <TabsTrigger value="sms" className="gap-1.5">
          <MessageSquare className="w-4 h-4" />
          SMS
        </TabsTrigger>
      </TabsList>
      <TabsContent value="orders" className="mt-0">
        <OrderNotifications />
      </TabsContent>
      <TabsContent value="sms" className="mt-0">
        <SmsLogs />
      </TabsContent>
    </Tabs>
  );
}
