import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Rent Management Screens
import ShopDashboardScreen from '../screens/rent/shop/ShopDashboardScreen';
import ManageRentProductsScreen from '../screens/rent/shop/ManageRentProductsScreen';
import CreateRentProductScreen from '../screens/rent/shop/CreateRentProductScreen';
import EditRentProductScreen from '../screens/rent/shop/EditRentProductScreen';
import ShopRentProductDetailScreen from '../screens/rent/shop/ShopRentProductDetailScreen';
import ShopOrdersScreen from '../screens/rent/shop/ShopOrdersScreen';
import ShopRentOrderDetailScreen from '../screens/rent/shop/ShopRentOrderDetailScreen';
import InventoryDashboardScreen from '../screens/rent/shop/InventoryDashboardScreen';
import RentInventoryDetailScreen from '../screens/rent/shop/RentInventoryDetailScreen';
import ConvertToThriftScreen from '../screens/rent/shop/ConvertToThriftScreen';

// Thrift Management Screens
import ShopThriftListingsScreen from '../screens/thrift/shop/ShopThriftListingsScreen';
import CreateThriftListingScreen from '../screens/thrift/shop/CreateThriftListingScreen';
import EditThriftListingScreen from '../screens/thrift/shop/EditThriftListingScreen';
import ShopThriftListingDetailScreen from '../screens/thrift/shop/ShopThriftListingDetailScreen';
import ShopThriftOrdersScreen from '../screens/thrift/shop/ShopThriftOrdersScreen';
import ShopThriftOrderDetailScreen from '../screens/thrift/shop/ShopThriftOrderDetailScreen';

// Finance & Revenue
import RevenueDashboardScreen from '../screens/finance/RevenueDashboardScreen';
import ShopRevenueScreen from '../screens/rent/shop/ShopRevenueScreen';

// Profile, KYC & Notifications
import ShopOwnerProfileScreen from '../screens/profile/ShopOwnerProfileScreen';
import ShopOwnerKycScreen from '../screens/kyc/ShopOwnerKycScreen';
import ShopNotificationsScreen from '../screens/notification/ShopNotificationsScreen';

const Stack = createNativeStackNavigator();

export const ShopNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Dashboard */}
      <Stack.Screen name="ShopDashboard" component={ShopDashboardScreen} />

      {/* 2. Rent Products & Inventory */}
      <Stack.Screen name="ManageRentProducts" component={ManageRentProductsScreen} />
      <Stack.Screen name="CreateRentProduct" component={CreateRentProductScreen} />
      <Stack.Screen name="EditRentProduct" component={EditRentProductScreen} />
      <Stack.Screen name="ShopRentProductDetail" component={ShopRentProductDetailScreen} />
      <Stack.Screen name="InventoryDashboard" component={InventoryDashboardScreen} />
      <Stack.Screen name="RentInventoryDetail" component={RentInventoryDetailScreen} />
      <Stack.Screen name="ConvertToThrift" component={ConvertToThriftScreen} />

      {/* 3. Rent Orders */}
      <Stack.Screen name="ShopOrders" component={ShopOrdersScreen} />
      <Stack.Screen name="ShopRentOrderDetail" component={ShopRentOrderDetailScreen} />

      {/* 4. Thrift Listings */}
      <Stack.Screen name="ShopThriftListings" component={ShopThriftListingsScreen} />
      <Stack.Screen name="CreateThriftListing" component={CreateThriftListingScreen} />
      <Stack.Screen name="EditThriftListing" component={EditThriftListingScreen} />
      <Stack.Screen name="ShopThriftListingDetail" component={ShopThriftListingDetailScreen} />

      {/* 5. Thrift Orders */}
      <Stack.Screen name="ShopThriftOrders" component={ShopThriftOrdersScreen} />
      <Stack.Screen name="ShopThriftOrderDetail" component={ShopThriftOrderDetailScreen} />

      {/* 6. Finance & Revenue */}
      <Stack.Screen name="ShopRevenue" component={ShopRevenueScreen} />
      <Stack.Screen name="RevenueDashboard" component={RevenueDashboardScreen} />

      {/* 7. Settings, KYC & Notifications */}
      <Stack.Screen name="ShopOwnerProfile" component={ShopOwnerProfileScreen} />
      <Stack.Screen name="ShopOwnerKyc" component={ShopOwnerKycScreen} />
      <Stack.Screen name="ShopNotifications" component={ShopNotificationsScreen} />
    </Stack.Navigator>
  );
};

export default ShopNavigator;
