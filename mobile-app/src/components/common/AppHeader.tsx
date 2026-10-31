import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AppHeaderProps {
  [key: string]: any;
}

export const AppHeader: React.FC<AppHeaderProps> = () => {
  return (
    <View style={styles.container}>
      <Text>AppHeader</Text>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
