import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.profileImage}
        source={{ uri: 'https://example.com/your-profile-image.jpg' }}
      />
      <Text style={styles.username}>John Doe</Text>
      <Text style={styles.email}>john.doe@example.com</Text>

      {/* Add more profile information as needed */}
      
      <Button
        title="Edit Profile"
        onPress={() => {
          // Add navigation logic to navigate to the edit profile screen
        }}
      />

      <Button
        title="Logout"
        onPress={() => {
          // Add logic to handle user logout
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 16,
  },
  // Add more styles for additional profile information
});

export default ProfileScreen;
