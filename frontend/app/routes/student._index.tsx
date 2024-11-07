import {Outlet} from "@remix-run/react";
import {AppSidebar} from "~/components/app-sidebar";
import {SidebarTrigger} from "~/components/ui/sidebar";

export default function StudentLayout() {
    return (
        <div className="flex">
            {/* Sidebar */}
            <AppSidebar userRole='student'/>

            {/* Main content area */}
            <main className="flex-1">
                <SidebarTrigger />
                <Outlet/>
            </main>
        </div>
    );
}