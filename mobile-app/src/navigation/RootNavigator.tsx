import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';
import AuthNavigator from './AuthNavigator';
import ShopNavigator from './ShopNavigator';
import AdminNavigator from './AdminNavigator';

// Public info screens accessible from Sidebar (dấu 3 gạch)
import AboutScreen from '../screens/home/AboutScreen';
import HowItWorksScreen from '../screens/home/HowItWorksScreen';
import FAQScreen from '../screens/home/FAQScreen';
import ContactScreen from '../screens/home/ContactScreen';
import CartScreen from '../screens/cart/CartScreen';
import WishlistScreen from '../screens/wishlist/WishlistScreen';

// Product Details Screens
import RentProductDetailScreen from '../screens/rent/RentProductDetailScreen';
import ThriftDetailScreen from '../screens/thrift/ThriftDetailScreen';

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
        </Stack.Navigator>

        {/* Global Slide-out Drawer */}
        <AppSidebarDrawer />
      </NavigationContainer>
    </DrawerProvider>
  );
};

export default RootNavigator;
