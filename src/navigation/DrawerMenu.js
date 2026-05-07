import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const PAGES = ['Home', 'Activity', 'Discover', 'Profile'];
const ROOT_SCREEN = 'Advent Fitness';

const DrawerMenu = (props) => {
  const { navigation } = props;

  const navigateToPage = (page) => {
    navigation.navigate(ROOT_SCREEN, { screen: page });
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {PAGES.map((page) => (
        <TouchableOpacity
          key={page}
          onPress={() => navigateToPage(page)}
          style={styles.menuItem}
        >
          <Text>{page}</Text>
        </TouchableOpacity>
      ))}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 10,
  },
});

export default DrawerMenu;
