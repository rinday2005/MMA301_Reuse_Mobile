import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AddressSelectorProps {
  [key: string]: any;
}

export const AddressSelector: React.FC<AddressSelectorProps> = () => {
  return (
    <View style={styles.container}>
      <Text>AddressSelector</Text>
    </View>
  );
};

export default AddressSelector;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
