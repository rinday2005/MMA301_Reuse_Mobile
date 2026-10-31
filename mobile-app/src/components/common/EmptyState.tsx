import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface EmptyStateProps {
  [key: string]: any;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <View style={styles.container}>
      <Text>EmptyState</Text>
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
