import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface LoadingIndicatorProps {
  [key: string]: any;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = () => {
  return (
    <View style={styles.container}>
      <Text>LoadingIndicator</Text>
    </View>
  );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
