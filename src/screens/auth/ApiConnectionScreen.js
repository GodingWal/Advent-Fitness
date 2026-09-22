import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { getApiBaseUrl, setApiBaseUrl } from '../../services/http';
import { setStoredDevApiUrl } from '../../services/apiHealth';
import { strings } from '../../i18n/strings';
import { colors, spacing, typography } from '../../theme';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

function helpText(url) {
  const template = strings.access.connectionHelp || 'Backend unreachable at <url>.';
  return String(template).replace('<url>', url || '(unknown)');
}

export default function ApiConnectionScreen({ url, error, status = 'disconnected', onRetry }) {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const [draft, setDraft] = useState(url || '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setDraft(url || '');
  }, [url]);

  const connected = status === 'connected';
  const address = url || safeBaseUrl();

  const handleRetry = async () => {
    if (!onRetry) return;
    setChecking(true);
    try {
      await onRetry();
    } finally {
      setChecking(false);
    }
  };

  const handleSaveAddress = async () => {
    const next = String(draft || '').trim();
    if (!next) return;
    setSaving(true);
    try {
      await setStoredDevApiUrl(next);
      setApiBaseUrl(next);
      await handleRetry();
    } finally {
      setSaving(false);
    }
  };

  const handleClearOverride = async () => {
    setSaving(true);
    try {
      await setStoredDevApiUrl(null);
      setApiBaseUrl(null);
      await handleRetry();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar title="CONNECTION" />

      <View style={[styles.body, { paddingBottom: insets.bottom + spacing.l }]}>
        <Caps size={10} color={colors.textMute}>
          {strings.access.connectionTitle?.toUpperCase() || 'CONNECTION'}
        </Caps>
        <Text style={styles.title}>
          {connected ? 'You’re\n' : 'Can’t reach\n'}
          <Text style={{ color: connected ? colors.accent : colors.accent2 }}>
            {connected ? 'connected.' : 'the backend.'}
          </Text>
        </Text>

        <Caps size={9} color={colors.textMute} style={styles.label}>
          {strings.access.apiAddressLabel || 'API ADDRESS'}
        </Caps>
        <Mono size={13} color={colors.text} style={styles.address}>
          {address || '(not configured)'}
        </Mono>

        <View style={styles.statusRow}>
          <View
            style={[styles.dot, { backgroundColor: connected ? colors.accent : colors.accent2 }]}
          />
          <Text style={styles.statusText}>
            {status === 'checking'
              ? strings.access.checking
              : connected
                ? strings.access.connected
                : strings.access.disconnected}
          </Text>
        </View>

        {!connected ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {error || helpText(address)}
          </Text>
        ) : null}

        {isDev ? (
          <View style={styles.editor}>
            <Caps size={9} color={colors.textMute} style={styles.label}>
              DEV API OVERRIDE
            </Caps>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="http://192.168.1.10:3000"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              accessibilityLabel="Development API address"
            />
            <View style={styles.editorRow}>
              <PrimaryButton
                label={strings.access.saveAddress || 'Save address'}
                onPress={handleSaveAddress}
                loading={saving}
                disabled={saving || !String(draft || '').trim()}
                style={styles.editorBtn}
              />
              <TouchableOpacity
                onPress={handleClearOverride}
                style={styles.clearBtn}
                accessibilityRole="button"
              >
                <Text style={styles.clearText}>
                  {strings.access.clearOverride || 'Use default'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View style={styles.spacer} />

        <PrimaryButton
          label={strings.access.retry || 'Retry'}
          trailingIcon="refresh"
          onPress={handleRetry}
          loading={checking}
        />
        {isDev ? (
          <TouchableOpacity
            onPress={handleRetry}
            style={styles.offlineBtn}
            accessibilityRole="button"
            accessibilityLabel={strings.access.continueOffline || 'Continue offline'}
          >
            {checking ? (
              <ActivityIndicator size="small" color={colors.textMute} />
            ) : (
              <Text style={styles.offlineText}>
                {(strings.access.continueOffline || 'Continue offline').toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function safeBaseUrl() {
  try {
    return getApiBaseUrl() || '';
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: spacing.edge, paddingTop: spacing.l },
  title: {
    ...typography.h1,
    fontSize: 38,
    lineHeight: 40,
    color: colors.text,
    marginTop: spacing.s,
    marginBottom: spacing.xl,
  },
  label: { marginBottom: spacing.s },
  address: { marginBottom: spacing.m },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.m },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.s },
  statusText: { ...typography.caps, fontSize: 11, color: colors.text },
  errorText: {
    ...typography.mono,
    fontSize: 12,
    color: colors.accent2,
    marginTop: 4,
    lineHeight: 18,
  },
  editor: { marginTop: spacing.l },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: spacing.m,
    color: colors.text,
    ...typography.body,
    fontSize: 14,
  },
  editorRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.m },
  editorBtn: { flex: 1 },
  clearBtn: { paddingVertical: spacing.m, paddingHorizontal: spacing.base },
  clearText: { ...typography.caps, fontSize: 10, color: colors.textMute },
  spacer: { flex: 1 },
  offlineBtn: { alignItems: 'center', paddingVertical: spacing.base, marginTop: spacing.s },
  offlineText: { ...typography.caps, fontSize: 10, color: colors.textDim, letterSpacing: 2 },
});
