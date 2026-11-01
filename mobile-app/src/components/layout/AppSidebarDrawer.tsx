import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserSidebarDrawer } from './UserSidebarDrawer';
import { GuestSidebarDrawer } from './GuestSidebarDrawer';

/**
 * AppSidebarDrawer automatically switches between:
 * - UserSidebarDrawer (when authenticated as regular customer / user)
 * - GuestSidebarDrawer (when browsing as guest without login)
 */
export const AppSidebarDrawer: React.FC = () => {
  const { user } = useAuth();

  if (user) {
    return <UserSidebarDrawer />;
  }

  return <GuestSidebarDrawer />;
};

export default AppSidebarDrawer;
