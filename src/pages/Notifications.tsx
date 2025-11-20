import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationTemplates } from "@/components/notifications/NotificationTemplates";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";

const Notifications = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage email templates and notification settings
          </p>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <NotificationTemplates />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
