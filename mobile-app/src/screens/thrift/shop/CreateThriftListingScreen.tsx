import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CreateThriftListingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CreateThriftListingScreen</Text>
    </View>
  );
};

export default CreateThriftListingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
