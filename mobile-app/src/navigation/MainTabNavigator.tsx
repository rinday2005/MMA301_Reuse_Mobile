import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import RentMarketplaceScreen from '../screens/rent/RentMarketplaceScreen';
import ThriftMarketplaceScreen from '../screens/thrift/ThriftMarketplaceScreen';
import CartScreen from '../screens/cart/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="RentTab" component={RentMarketplaceScreen} options={{ title: 'Thuê đồ' }} />
      <Tab.Screen name="ThriftTab" component={ThriftMarketplaceScreen} options={{ title: 'Thanh lý' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
