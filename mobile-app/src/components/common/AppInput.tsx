import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface AppInputProps {
  [key: string]: any;
}

export const AppInput: React.FC<AppInputProps> = () => {
  return (
    <View style={styles.container}>
      <Text>AppInput</Text>
    </View>
  );
};

export default AppInput;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
