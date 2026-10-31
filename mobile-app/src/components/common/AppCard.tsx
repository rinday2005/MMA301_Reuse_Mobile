import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AppCardProps {
  [key: string]: any;
}

export const AppCard: React.FC<AppCardProps> = () => {
  return (
    <View style={styles.container}>
      <Text>AppCard</Text>
    </View>
  );
};

export default AppCard;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
