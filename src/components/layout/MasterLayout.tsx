import React from 'react';
import Header from './Header';
import type { UserRole } from './Header';
import Footer from './Footer';
import { Sidebar } from './Sidebar';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-stone-900 antialiased">
      {/* Header */}
      <Header userRole={userRole} onLogout={onLogout} />

      {/* Body Content */}
      <div className="flex flex-1 w-full">
        {/* Sidebar ADMIN / SHOP — luôn hiện bên trái */}
        {showAdminShopSidebar && (
          <Sidebar role={userRole === 'ADMIN' ? 'ADMIN' : 'SHOP'} />
        )}

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