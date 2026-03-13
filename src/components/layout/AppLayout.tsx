import { Outlet } from "react-router-dom";
import { Header } from "./Header";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
