import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function PatientLayout() {
  return (
    <div className="patient-app-shell flex flex-col h-[100dvh] overflow-hidden relative">
      <div className="flex-1 overflow-y-auto w-full pb-[66px]">
        <Header />
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
