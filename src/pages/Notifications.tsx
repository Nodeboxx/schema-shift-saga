import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationTemplates } from "@/components/notifications/NotificationTemplates";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

const Notifications = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Manage email templates and notification settings
          </p>
        </div>

        <Tabs defaultValue="templates">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Email Templates</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4 md:mt-6">
            <NotificationTemplates />
          </TabsContent>

          <TabsContent value="settings" className="mt-4 md:mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
