import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import RentMarketplaceScreen from '../screens/rent/RentMarketplaceScreen';
import ThriftMarketplaceScreen from '../screens/thrift/ThriftMarketplaceScreen';
import CategoryMarketplaceScreen from '../screens/category/CategoryMarketplaceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#141310',
        tabBarInactiveTintColor: '#A8A29E',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EBE5D8',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="RentTab"
        component={RentMarketplaceScreen}
        options={{
          tabBarLabel: 'Thuê RENT',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ThriftTab"
        component={ThriftMarketplaceScreen}
        options={{
          tabBarLabel: 'Mua THRIFT',
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoryMarketplaceScreen}
        options={{
          tabBarLabel: 'Danh mục',
          tabBarIcon: ({ color, size }) => <Feather name="grid" size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
