import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface TabBarProps {
  [key: string]: any;
}

export const TabBar: React.FC<TabBarProps> = () => {
  return (
    <View style={styles.container}>
      <Text>TabBar</Text>
    </View>
  );
};

export default TabBar;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
