import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import KycApprovalScreen from '../screens/admin/KycApprovalScreen';
import ListingApprovalScreen from '../screens/admin/ListingApprovalScreen';
import ThriftListingApprovalScreen from '../screens/admin/ThriftListingApprovalScreen';
import DisputeManagementScreen from '../screens/admin/DisputeManagementScreen';
import PlatformFinanceScreen from '../screens/admin/PlatformFinanceScreen';

const Stack = createNativeStackNavigator();

export const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Quản trị hệ thống' }} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} options={{ title: 'Quản lý người dùng' }} />
      <Stack.Screen name="KycApproval" component={KycApprovalScreen} options={{ title: 'Duyệt KYC' }} />
      <Stack.Screen name="ListingApproval" component={ListingApprovalScreen} options={{ title: 'Duyệt sản phẩm thuê' }} />
      <Stack.Screen name="ThriftListingApproval" component={ThriftListingApprovalScreen} options={{ title: 'Duyệt tin thanh lý' }} />
      <Stack.Screen name="DisputeManagement" component={DisputeManagementScreen} options={{ title: 'Tranh chấp khiếu nại' }} />
      <Stack.Screen name="PlatformFinance" component={PlatformFinanceScreen} options={{ title: 'Tài chính sàn' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
