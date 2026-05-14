import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Image } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps } from '../../components/VoltPrimitives';
import { mockUser } from '../../data/mockUser';
import { colors, spacing, typography, radius } from '../../theme';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState(mockUser.name);
  const [location, setLocation] = useState(mockUser.location);
  const [bio, setBio] = useState('Surfer. Hiker. San Diego based.');

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="EDIT PROFILE" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <Caps size={10} color={colors.accent} style={{ marginTop: spacing.s }}>
            Change Photo
          </Caps>
        </View>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Name
        </Caps>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor={colors.textDim}
        />

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Location
        </Caps>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholderTextColor={colors.textDim}
        />

        <Caps size={9} color={colors.textMute} style={styles.label}>
          Bio
        </Caps>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholderTextColor={colors.textDim}
        />

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton
            label="Save Changes"
            trailingIcon="checkmark"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.edge, paddingBottom: 120 },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.l },
  avatar: { width: 90, height: 90, borderRadius: radius.s },
  label: { marginTop: spacing.l, marginBottom: spacing.xs },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.m,
    color: colors.text,
    ...typography.body,
    fontSize: 15,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});
