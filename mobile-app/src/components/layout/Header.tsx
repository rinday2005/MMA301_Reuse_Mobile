import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface HeaderProps {
  [key: string]: any;
}

export const Header: React.FC<HeaderProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Header</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
