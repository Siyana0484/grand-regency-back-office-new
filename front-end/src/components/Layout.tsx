import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "../scss/modal.scss";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 overflow-auto bg-gray-200 h-full pb-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
