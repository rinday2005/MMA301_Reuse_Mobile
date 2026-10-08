import React from 'react';
import Header from './Header';
import type { UserRole } from './Header';
import Footer from './Footer';
import { Sidebar } from './Sidebar';
import { GuestSidebar } from './GuestSidebar';

interface MasterLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const MasterLayout: React.FC<MasterLayoutProps> = ({
  children,
  userRole = 'GUEST',
  onLogout
}) => {
  const showAdminShopSidebar = userRole === 'ADMIN' || userRole === 'SHOP';
  const showGuestSidebar = userRole === 'GUEST' || userRole === 'USER';

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f2] text-stone-900 antialiased">
      {/* Header */}
      <Header userRole={userRole} onLogout={onLogout} />

      {/* Body Content */}
      <div className="flex flex-1 w-full">
        {/* Sidebar ADMIN / SHOP — luôn hiện bên trái */}
        {showAdminShopSidebar && (
          <Sidebar role={userRole === 'ADMIN' ? 'ADMIN' : 'SHOP'} />
        )}

        {/* Sidebar GUEST / USER — toggle overlay, hiện trên tất cả pages */}
        {showGuestSidebar && <GuestSidebar />}

        <main className={`flex-1 w-full pt-28 ${showAdminShopSidebar ? 'px-4 lg:px-8' : ''}`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MasterLayout;