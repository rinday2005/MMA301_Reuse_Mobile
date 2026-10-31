import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface RentalCalendarPickerProps {
  [key: string]: any;
}

export const RentalCalendarPicker: React.FC<RentalCalendarPickerProps> = () => {
  return (
    <View style={styles.container}>
      <Text>RentalCalendarPicker</Text>
    </View>
  );
};

export default RentalCalendarPicker;

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});
