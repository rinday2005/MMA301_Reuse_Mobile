import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import ShopManagementScreen from '../screens/admin/ShopManagementScreen';
import ListingApprovalScreen from '../screens/admin/ListingApprovalScreen';
import RentReviewScreen from '../screens/admin/RentReviewScreen';
import ThriftListingApprovalScreen from '../screens/admin/ThriftListingApprovalScreen';
import ThriftReviewScreen from '../screens/admin/ThriftReviewScreen';
import DisputeManagementScreen from '../screens/admin/DisputeManagementScreen';
import DisputeReviewScreen from '../screens/admin/DisputeReviewScreen';
import KycApprovalScreen from '../screens/admin/KycApprovalScreen';
import KycReviewScreen from '../screens/admin/KycReviewScreen';
import CategoryManagementScreen from '../screens/admin/CategoryManagementScreen';
import PlatformFinanceScreen from '../screens/admin/PlatformFinanceScreen';

const Stack = createNativeStackNavigator();

export const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
      <Stack.Screen name="ShopManagement" component={ShopManagementScreen} />
      <Stack.Screen name="ListingApproval" component={ListingApprovalScreen} />
      <Stack.Screen name="RentReview" component={RentReviewScreen} />
      <Stack.Screen name="ThriftListingApproval" component={ThriftListingApprovalScreen} />
      <Stack.Screen name="ThriftReview" component={ThriftReviewScreen} />
      <Stack.Screen name="DisputeManagement" component={DisputeManagementScreen} />
      <Stack.Screen name="DisputeReview" component={DisputeReviewScreen} />
      <Stack.Screen name="KycApproval" component={KycApprovalScreen} />
      <Stack.Screen name="KycReview" component={KycReviewScreen} />
      <Stack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
      <Stack.Screen name="PlatformFinance" component={PlatformFinanceScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
