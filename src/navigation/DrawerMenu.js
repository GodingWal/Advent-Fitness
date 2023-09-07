// DrawerMenu.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const DrawerMenu = ({ navigation }) => {
  const pages = ['Home', 'Activity', 'Discover', 'Profile'];

  const navigateToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <View style={styles.container}>
      {pages.map((page, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigateToPage(page)}
          style={styles.menuItem}
        >
          <Text>{page}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    paddingVertical: 10,
  },
});

export default DrawerMenu;
