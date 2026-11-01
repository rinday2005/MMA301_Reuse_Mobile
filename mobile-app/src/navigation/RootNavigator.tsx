import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import ShopNavigator from './ShopNavigator';
import AdminNavigator from './AdminNavigator';

// Public info screens accessible from Sidebar
import AboutScreen from '../screens/home/AboutScreen';
import HowItWorksScreen from '../screens/home/HowItWorksScreen';
import FAQScreen from '../screens/home/FAQScreen';
import ContactScreen from '../screens/home/ContactScreen';
import CartScreen from '../screens/cart/CartScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';
import RentCheckoutScreen from '../screens/rent/RentCheckoutScreen';
import ThriftCheckoutScreen from '../screens/thrift/ThriftCheckoutScreen';

// Product Details Screens
import RentProductDetailScreen from '../screens/rent/RentProductDetailScreen';
import ThriftDetailScreen from '../screens/thrift/ThriftDetailScreen';

// Authenticated User Screens
import UserDashboardScreen from '../screens/home/UserDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UserWalletScreen from '../screens/wallet/UserWalletScreen';
import CustomerKycScreen from '../screens/kyc/CustomerKycScreen';
import MyRentOrdersScreen from '../screens/rent/MyRentOrdersScreen';
import RentOrderDetailScreen from '../screens/rent/RentOrderDetailScreen';
import ReturnRequestScreen from '../screens/rent/ReturnRequestScreen';
import MyThriftOrdersScreen from '../screens/thrift/MyThriftOrdersScreen';
import ThriftOrderDetailScreen from '../screens/thrift/ThriftOrderDetailScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import NotificationCenterScreen from '../screens/notification/NotificationCenterScreen';

// Mobile Sidebar Drawer
import { DrawerProvider } from '../context/DrawerContext';
import { AppSidebarDrawer } from '../components/layout/AppSidebarDrawer';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <DrawerProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="Shop" component={ShopNavigator} />
          <Stack.Screen name="Admin" component={AdminNavigator} />

          {/* Product Details */}
          <Stack.Screen name="RentProductDetail" component={RentProductDetailScreen} />
          <Stack.Screen name="ThriftDetail" component={ThriftDetailScreen} />

          {/* Public info screens in Sidebar Drawer */}
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />

          {/* Cart & Wishlist */}
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="RentCheckout" component={RentCheckoutScreen} />
          <Stack.Screen name="ThriftCheckout" component={ThriftCheckoutScreen} />

          {/* Authenticated User Screens */}
          <Stack.Screen name="UserDashboard" component={UserDashboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="UserWallet" component={UserWalletScreen} />
          <Stack.Screen name="CustomerKyc" component={CustomerKycScreen} />
          <Stack.Screen name="MyRentOrders" component={MyRentOrdersScreen} />
          <Stack.Screen name="RentOrderDetail" component={RentOrderDetailScreen} />
          <Stack.Screen name="ReturnRequest" component={ReturnRequestScreen} />
          <Stack.Screen name="MyThriftOrders" component={MyThriftOrdersScreen} />
          <Stack.Screen name="ThriftOrderDetail" component={ThriftOrderDetailScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
        </Stack.Navigator>

        {/* Global Slide-out Drawer (UserSidebarDrawer when logged in / GuestSidebarDrawer when guest) */}
        <AppSidebarDrawer />
      </NavigationContainer>
    </DrawerProvider>
  );
};

export default RootNavigator;
