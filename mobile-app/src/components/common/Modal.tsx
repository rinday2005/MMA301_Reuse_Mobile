import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ModalProps {
  [key: string]: any;
}

export const Modal: React.FC<ModalProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Modal</Text>
    </View>
  );
};

export default Modal;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
