import { Outlet } from "react-router-dom";
import Topbar from "../ui/Topbar";
// import { NavBar } from "./NavBar";

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F0F1A] to-[#1A1A2C] text-[#E0E0FF]">

            <div className="flex-1">
                <Topbar />
                <Outlet />
            </div>
        </div>
    );
};
export default MainLayout