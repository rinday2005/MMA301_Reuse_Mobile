import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ShopNotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopNotificationsScreen</Text>
    </View>
  );
};

export default ShopNotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
