import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ChatWidget from '../chat/ChatWidget';

const MainLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        <Topbar />
        <div className="content-area">
          <Outlet /> {/* Tutaj renderują się dynamiczne podstrony */}
        </div>
        <ChatWidget />
      </main>
    </div>
  );
};

export default MainLayout;
