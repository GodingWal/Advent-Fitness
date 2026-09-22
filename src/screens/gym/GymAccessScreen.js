import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import { Caps } from '../../components/VoltPrimitives';
import DoorAccessButton from '../../components/gym/DoorAccessButton';
import AccessHistoryItem from '../../components/gym/AccessHistoryItem';
import AccessQrCode from '../../components/gym/AccessQrCode';
import {
  getDoors,
  getAccessHistory,
  unlockDoor,
  requestQrToken,
  getMemberships,
} from '../../services/access';
import { getCurrentLocation } from '../../services/location';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography } from '../../theme';

export function mapDenyToCopy(code, fallback) {
  const key = String(code || '').toUpperCase();
  if (key.includes('MEMBERSHIP_INACTIVE') || key.includes('INACTIVE_MEMBERSHIP')) {
    return strings.access.deniedMembershipInactive;
  }
  if (key.includes('RATE_LIMIT') || key.includes('TOO_MANY') || key === '429') {
    return strings.access.deniedRateLimited;
  }
  if (key.includes('PROXIMITY') || key.includes('TOO_FAR') || key.includes('DISTANCE')) {
    return strings.access.deniedProximity;
  }
  if (key.includes('HOURS') || key.includes('SCHEDULE') || key.includes('TIME')) {
    return strings.access.deniedOutsideHours;
  }
  if (key.includes('OFFLINE') || key.includes('MAINTENANCE') || key.includes('DISABLED')) {
    return strings.access.deniedOffline;
  }
  if (
    key.includes('NO_ACCESS') ||
    key.includes('NOT_INCLUDED') ||
    key.includes('FORBIDDEN') ||
    key.includes('DENIED')
  ) {
    return strings.access.deniedNoAccess;
  }
  if (typeof fallback === 'string' && fallback.trim()) return fallback;
  return strings.access.deniedGeneric;
}

function extractServerDeny(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 429) {
    return { code: 'RATE_LIMITED', message: data?.message };
  }
  const code = data?.code || data?.error || null;
  const message = data?.message || error?.message || null;
  return { code, message };
}

const QR_REFRESH_MS = 45_000;

export default function GymAccessScreen({ navigation, route }) {
  const locationId = route?.params?.locationId;
  const gymName = route?.params?.gymName || strings.access.title;
  const membershipIdParam = route?.params?.membershipId || null;

  const [doors, setDoors] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [unlockingId, setUnlockingId] = useState(null);
  const [doorFeedback, setDoorFeedback] = useState({});

  const [qrToken, setQrToken] = useState(null);
  const [qrExpiresAt, setQrExpiresAt] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [membershipId, setMembershipId] = useState(membershipIdParam);
  const qrTimerRef = useRef(null);

  const load = useCallback(async () => {
    if (!locationId) {
      setError(strings.access.loadError);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const [doorsRes, historyRes] = await Promise.all([
        getDoors(locationId),
        getAccessHistory().catch(() => ({ events: [] })),
      ]);
      setDoors(Array.isArray(doorsRes?.doors) ? doorsRes.doors : []);
      setHistory(Array.isArray(historyRes?.events) ? historyRes.events : []);
    } catch (e) {
      setError(e?.response?.data?.message || strings.access.loadError);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [doorsRes, historyRes] = await Promise.all([
        getDoors(locationId),
        getAccessHistory().catch(() => ({ events: [] })),
      ]);
      setDoors(Array.isArray(doorsRes?.doors) ? doorsRes.doors : []);
      setHistory(Array.isArray(historyRes?.events) ? historyRes.events : []);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || strings.access.loadError);
    } finally {
      setRefreshing(false);
    }
  }, [locationId]);

  const refreshHistory = useCallback(async () => {
    try {
      const res = await getAccessHistory();
      setHistory(Array.isArray(res?.events) ? res.events : []);
    } catch {
      // history is best-effort after unlock
    }
  }, []);

  const handleUnlock = useCallback(
    async (door) => {
      if (!door || unlockingId) return;
      setUnlockingId(door.id);
      setDoorFeedback((prev) => ({ ...prev, [door.id]: { error: null, success: false } }));
      try {
        let coords = null;
        try {
          coords = await getCurrentLocation();
        } catch {
          coords = null;
        }
        const payload = {};
        if (coords?.latitude != null && coords?.longitude != null) {
          payload.latitude = coords.latitude;
          payload.longitude = coords.longitude;
          if (coords.accuracy != null) payload.accuracyMeters = coords.accuracy;
        }
        const res = await unlockDoor(door.id, payload);
        if (res?.success) {
          setDoorFeedback((prev) => ({ ...prev, [door.id]: { error: null, success: true } }));
        } else {
          const copy = mapDenyToCopy(res?.code, res?.message);
          setDoorFeedback((prev) => ({ ...prev, [door.id]: { error: copy, success: false } }));
        }
      } catch (e) {
        const { code, message } = extractServerDeny(e);
        const copy = mapDenyToCopy(code, message);
        setDoorFeedback((prev) => ({ ...prev, [door.id]: { error: copy, success: false } }));
      } finally {
        setUnlockingId(null);
        refreshHistory();
      }
    },
    [unlockingId, refreshHistory]
  );

  const fetchQr = useCallback(
    async (mid) => {
      const target = mid || membershipIdParam;
      if (!target) return;
      setQrLoading(true);
      setQrError(null);
      try {
        const res = await requestQrToken(target);
        setQrToken(res?.token || null);
        setQrExpiresAt(res?.expiresAt || null);
        setMembershipId(target);
      } catch (e) {
        setQrError(e?.response?.data?.message || strings.access.loadError);
      } finally {
        setQrLoading(false);
      }
    },
    [membershipIdParam]
  );

  // Resolve a membership id when the route did not provide one.
  useEffect(() => {
    if (membershipIdParam) {
      fetchQr(membershipIdParam);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getMemberships();
        const list = Array.isArray(res?.memberships) ? res.memberships : [];
        const active = list.find((m) => String(m?.status).toUpperCase() === 'ACTIVE') || list[0];
        if (!cancelled && active?.id) fetchQr(active.id);
      } catch {
        // QR stays empty when memberships cannot load
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [membershipIdParam, fetchQr]);

  // Auto-refresh QR at 45s or on expiresAt, whichever is sooner.
  useEffect(() => {
    if (!qrToken || !membershipId) return undefined;
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    let delay = QR_REFRESH_MS;
    if (qrExpiresAt) {
      const msLeft = new Date(qrExpiresAt).getTime() - Date.now();
      if (Number.isFinite(msLeft) && msLeft > 0) delay = Math.min(msLeft, QR_REFRESH_MS);
      else delay = 5_000;
    }
    qrTimerRef.current = setTimeout(() => fetchQr(membershipId), delay);
    return () => {
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    };
  }, [qrToken, qrExpiresAt, membershipId, fetchQr]);

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="GYM ACCESS" />

      <View style={styles.headerRow}>
        <Caps size={10} color={colors.textMute}>
          {gymName}
        </Caps>
        <Text style={styles.h2}>{strings.access.title}.</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Caps size={10} color={colors.textMute} style={{ marginTop: spacing.m }}>
            {strings.access.loadingDoors}
          </Caps>
        </View>
      ) : error && doors.length === 0 ? (
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
          <Caps size={10} color={colors.textMute} style={styles.sectionKicker}>
            {strings.access.doorsTitle}
          </Caps>
          {doors.length === 0 ? (
            <Text style={styles.empty}>{strings.access.noDoors}</Text>
          ) : (
            doors.map((door) => (
              <DoorAccessButton
                key={door.id}
                door={door}
                loading={unlockingId === door.id}
                error={doorFeedback[door.id]?.error || null}
                success={doorFeedback[door.id]?.success || false}
                onUnlock={handleUnlock}
              />
            ))
          )}

          <View style={styles.qrBox}>
            <Caps size={10} color={colors.textMute}>
              {strings.access.qrTitle}
            </Caps>
            <View style={{ marginTop: spacing.m, alignItems: 'center' }}>
              {qrLoading && !qrToken ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <AccessQrCode token={qrToken} />
              )}
              {qrError ? <Text style={styles.errorText}>{qrError}</Text> : null}
              {qrToken ? (
                <Caps size={9} color={colors.textMute} style={{ marginTop: spacing.s }}>
                  {strings.access.qrExpiring}
                </Caps>
              ) : null}
              {membershipId ? (
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => fetchQr(membershipId)}
                  accessibilityRole="button"
                  accessibilityLabel={strings.access.qrRefresh}
                >
                  <Text style={styles.retryLabel}>{strings.access.qrRefresh}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <Caps size={10} color={colors.textMute} style={styles.sectionKicker}>
            {strings.access.historyTitle}
          </Caps>
          {history.length === 0 ? (
            <Text style={styles.empty}>—</Text>
          ) : (
            history.slice(0, 20).map((event) => <AccessHistoryItem key={event.id} event={event} />)
          )}
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
  sectionKicker: { marginTop: spacing.l, marginBottom: spacing.s },
  empty: { ...typography.bodySmall, color: colors.textMute },
  errorText: { ...typography.bodySmall, color: colors.accent2, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.m,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
  },
  retryLabel: { ...typography.caps, fontSize: 11, color: colors.text },
  qrBox: {
    marginTop: spacing.l,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    borderRadius: radius.m,
    padding: spacing.l,
  },
});
