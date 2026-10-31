import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShopDashboardScreen from '../screens/rent/shop/ShopDashboardScreen';
import ManageRentProductsScreen from '../screens/rent/shop/ManageRentProductsScreen';
import CreateRentProductScreen from '../screens/rent/shop/CreateRentProductScreen';
import EditRentProductScreen from '../screens/rent/shop/EditRentProductScreen';
import ShopOrdersScreen from '../screens/rent/shop/ShopOrdersScreen';
import ShopThriftListingsScreen from '../screens/thrift/shop/ShopThriftListingsScreen';
import CreateThriftListingScreen from '../screens/thrift/shop/CreateThriftListingScreen';

const Stack = createNativeStackNavigator();

export const ShopNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ShopDashboard" component={ShopDashboardScreen} options={{ title: 'Kênh người bán' }} />
      <Stack.Screen name="ManageRentProducts" component={ManageRentProductsScreen} options={{ title: 'Quản lý đồ thuê' }} />
      <Stack.Screen name="CreateRentProduct" component={CreateRentProductScreen} options={{ title: 'Thêm đồ thuê mới' }} />
      <Stack.Screen name="EditRentProduct" component={EditRentProductScreen} options={{ title: 'Chỉnh sửa đồ thuê' }} />
      <Stack.Screen name="ShopOrders" component={ShopOrdersScreen} options={{ title: 'Đơn hàng thuê' }} />
      <Stack.Screen name="ShopThriftListings" component={ShopThriftListingsScreen} options={{ title: 'Tin thanh lý' }} />
      <Stack.Screen name="CreateThriftListing" component={CreateThriftListingScreen} options={{ title: 'Đăng bán thanh lý' }} />
    </Stack.Navigator>
  );
};

export default ShopNavigator;
