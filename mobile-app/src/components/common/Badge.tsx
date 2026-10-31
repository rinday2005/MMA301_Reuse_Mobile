import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface BadgeProps {
  [key: string]: any;
}

export const Badge: React.FC<BadgeProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Badge</Text>
    </View>
  );
};

export default Badge;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
