import { AppLayout } from "@/components/layout/AppLayout";
import { UserGuide } from "@/components/dashboard/UserGuide";

const UserGuidePage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <UserGuide />
      </div>
    </AppLayout>
  );
};

export default UserGuidePage;
