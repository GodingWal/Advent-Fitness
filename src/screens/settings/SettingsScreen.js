import React from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import { useApp } from '../../state/AppContext';
import { useAuth } from '../../state/AuthContext';
import { colors, spacing, radius, typography, shadows } from '../../theme';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSetting, updatePrivacyZone } = useApp();
  const { signOut } = useAuth();

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Settings" bordered />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.section}>NOTIFICATIONS</Text>
        <Toggle
          icon="notifications-outline"
          title="Push Notifications"
          sub="Friend posts, requests, weekly summary"
          value={settings.pushEnabled}
          onChange={(v) => updateSetting('pushEnabled', v)}
        />

        <Text style={styles.section}>HEALTH & SYNC</Text>
        <Toggle
          icon="heart-outline"
          title="Sync with Health App"
          sub="Apple Health on iOS · Google Fit on Android"
          value={settings.healthSyncEnabled}
          onChange={(v) => updateSetting('healthSyncEnabled', v)}
        />

        <Text style={styles.section}>PRIVACY & SHARING</Text>
        <Toggle
          icon="shield-checkmark-outline"
          title="Privacy Zone"
          sub={`Hide routes within ${settings.privacyZone.radiusMi.toFixed(2)} mi of home`}
          value={settings.privacyZone.enabled}
          onChange={(v) => updatePrivacyZone({ enabled: v })}
        />
        <Toggle
          icon="locate-outline"
          title="Share Live Location with Friends"
          sub="Opt-in during recorded activities"
          value={settings.liveShareEnabled}
          onChange={(v) => updateSetting('liveShareEnabled', v)}
        />
        <Toggle
          icon="layers-outline"
          title="Activity Heatmap"
          sub="Show your past routes on the map"
          value={settings.heatmapEnabled}
          onChange={(v) => updateSetting('heatmapEnabled', v)}
        />

        <Text style={styles.section}>ACCOUNT</Text>
        <Row
          icon="person-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Row
          icon="trophy-outline"
          title="Achievements"
          onPress={() => navigation.navigate('Achievements')}
        />
        <Row
          icon="people-outline"
          title="Group Meetups"
          onPress={() => navigation.navigate('Meetups')}
        />
        <Row icon="log-out-outline" title="Sign Out" onPress={confirmSignOut} />
      </ScrollView>
    </View>
  );
}

function Toggle({ icon, title, sub, value, onChange }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} />
    </View>
  );
}

function Row({ icon, title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Ionicons name={icon} size={22} color={colors.accent} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 80 },
  section: { ...typography.labelCapsSmall, color: colors.textSecondary, marginTop: spacing.l, marginBottom: spacing.s },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.base,
    marginBottom: spacing.s,
    ...shadows.cardLight,
  },
  rowBody: { flex: 1, marginLeft: spacing.m },
  rowTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  rowSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
