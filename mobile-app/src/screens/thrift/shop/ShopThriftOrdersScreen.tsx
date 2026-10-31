import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ShopThriftOrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ShopThriftOrdersScreen</Text>
    </View>
  );
};

export default ShopThriftOrdersScreen;

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
