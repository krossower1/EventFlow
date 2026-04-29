import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <div className="content-area">
          <Outlet /> {/* Tutaj renderują się dynamiczne podstrony */}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;