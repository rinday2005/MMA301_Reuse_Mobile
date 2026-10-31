import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AppButtonProps {
  [key: string]: any;
}

export const AppButton: React.FC<AppButtonProps> = () => {
  return (
    <View style={styles.container}>
      <Text>AppButton</Text>
    </View>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
