import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const AppLayout = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <main className="flex-1 lg:ml-[240px] p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <div className="mx-auto max-w-[1280px]">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;