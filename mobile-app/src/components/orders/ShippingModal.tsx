import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ShippingModalProps {
  [key: string]: any;
}

export const ShippingModal: React.FC<ShippingModalProps> = () => {
  return (
    <View style={styles.container}>
      <Text>ShippingModal</Text>
    </View>
  );
};

export default ShippingModal;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
