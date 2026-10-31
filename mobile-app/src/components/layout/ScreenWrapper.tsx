import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ScreenWrapperProps {
  [key: string]: any;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = () => {
  return (
    <View style={styles.container}>
      <Text>ScreenWrapper</Text>
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
