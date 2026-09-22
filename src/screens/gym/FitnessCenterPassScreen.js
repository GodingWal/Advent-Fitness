import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import { Caps } from '../../components/VoltPrimitives';
import GymPassCard from '../../components/gym/GymPassCard';
import { getMemberships, getGymLocations } from '../../services/access';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography } from '../../theme';

export default function FitnessCenterPassScreen({ navigation }) {
  const [memberships, setMemberships] = useState([]);
  const [locationNames, setLocationNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getMemberships();
      const list = Array.isArray(res?.memberships) ? res.memberships : [];
      setMemberships(list);

      const gymIds = [...new Set(list.map((m) => m?.gym?.id).filter(Boolean))];
      const names = {};
      await Promise.all(
        gymIds.map(async (gymId) => {
          try {
            const locRes = await getGymLocations(gymId);
            const locs = Array.isArray(locRes?.locations) ? locRes.locations : [];
            locs.forEach((loc) => {
              if (loc?.id) names[loc.id] = loc.name || loc.id;
            });
          } catch {
            // location names are best-effort
          }
        })
      );
      setLocationNames(names);
    } catch (e) {
      setError(e?.response?.data?.message || strings.access.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getMemberships();
      const list = Array.isArray(res?.memberships) ? res.memberships : [];
      setMemberships(list);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || strings.access.loadError);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const resolveLocationId = (membership) => {
    if (Array.isArray(membership?.locationIds) && membership.locationIds.length > 0) {
      return membership.locationIds[0];
    }
    return null;
  };

  const openAccess = (membership) => {
    const locationId = resolveLocationId(membership);
    if (!locationId) return;
    navigation.navigate('GymAccess', {
      locationId,
      gymName: membership?.gym?.name,
      membershipId: membership?.id,
    });
  };

  const activeCount = memberships.filter(
    (m) => String(m?.status).toUpperCase() === 'ACTIVE'
  ).length;

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="GYM PASS" />

      <View style={styles.headerRow}>
        <Caps size={10} color={colors.textMute}>
          Gym Pass · {loading ? '…' : `${activeCount} active`}
        </Caps>
        <Text style={styles.h2}>Passes.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Caps size={10} color={colors.textMute} style={{ marginTop: spacing.m }}>
            {strings.access.loadingPasses}
          </Caps>
        </View>
      ) : error && memberships.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={load}
            accessibilityRole="button"
            accessibilityLabel={strings.access.retry}
          >
            <Text style={styles.retryLabel}>{strings.access.retry}</Text>
          </TouchableOpacity>
        </View>
      ) : memberships.length === 0 ? (
        <View style={styles.center}>
          <Caps size={10} color={colors.textMute}>
            {strings.access.noMemberships}
          </Caps>
          <Text style={styles.emptyBody}>{strings.access.noMembershipsBody}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          {memberships.map((m) => {
            const locId = resolveLocationId(m);
            const locName = locId ? locationNames[locId] : null;
            return (
              <GymPassCard
                key={m.id}
                membership={m}
                gymName={m?.gym?.name}
                locationName={locName}
                onPress={locId ? () => openAccess(m) : undefined}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { paddingHorizontal: spacing.edge, paddingTop: spacing.s, paddingBottom: spacing.m },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.edge },
  scroll: { padding: spacing.edge, paddingBottom: 120 },
  errorText: { ...typography.bodySmall, color: colors.accent2, textAlign: 'center' },
  emptyBody: {
    ...typography.bodySmall,
    color: colors.textMute,
    marginTop: spacing.s,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.m,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  retryLabel: { ...typography.caps, fontSize: 11, color: colors.text },
});
