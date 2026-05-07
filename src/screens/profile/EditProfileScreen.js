import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Image } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { mockUser } from '../../data/mockUser';
import { colors, spacing, typography, radius } from '../../theme';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState(mockUser.name);
  const [location, setLocation] = useState(mockUser.location);
  const [bio, setBio] = useState('Surfer. Hiker. San Diego based.');

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Edit Profile" bordered />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <Text style={styles.changePhoto}>Change Photo</Text>
        </View>
        <Text style={styles.label}>NAME</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        <Text style={styles.label}>LOCATION</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />
        <Text style={styles.label}>BIO</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          multiline
        />
        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton
            label="Save Changes"
            onPress={() => navigation.goBack()}
            style={{ backgroundColor: colors.accent }}
            textStyle={{ color: colors.white }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.base, paddingBottom: 120 },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.l },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  changePhoto: { ...typography.labelCapsSmall, color: colors.accent, marginTop: spacing.s },
  label: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: spacing.l },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.m,
    color: colors.textPrimary,
    ...typography.body,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
