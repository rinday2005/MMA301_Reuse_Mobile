import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserSidebarDrawer } from './UserSidebarDrawer';
import { GuestSidebarDrawer } from './GuestSidebarDrawer';
import { ShopOwnerSidebarDrawer } from './ShopOwnerSidebarDrawer';

/**
 * AppSidebarDrawer automatically switches between:
 * - ShopOwnerSidebarDrawer (when logged in as SHOP_OWNER)
 * - UserSidebarDrawer (when authenticated as regular customer / user)
 * - GuestSidebarDrawer (when browsing as guest without login)
 */
export const AppSidebarDrawer: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'SHOP_OWNER') {
      return <ShopOwnerSidebarDrawer />;
    }
    return <UserSidebarDrawer />;
  }

  return <GuestSidebarDrawer />;
};

export default AppSidebarDrawer;
