import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderBar from '../../components/HeaderBar';
import SearchField from '../../components/SearchField';
import POIFilterChip from '../../components/POIFilterChip';
import POIMarker from '../../components/POIMarker';
import POIDetailSheet from '../../components/POIDetailSheet';
import AddSpotModal from '../../components/AddSpotModal';
import { POI_CATEGORIES, mockPOIs } from '../../data/mockPOIs';
import { SAN_DIEGO, getCurrentLocation, haversineMiles } from '../../services/location';
import { fetchNearbyPOIs, hasPlacesKey } from '../../services/places';
import { useApp } from '../../state/AppContext';
import { strings } from '../../i18n/strings';
import { colors, spacing, radius, typography, shadows } from '../../theme';

const ALL_FILTERS = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'saved', label: 'Saved', icon: 'heart-outline' },
  ...POI_CATEGORIES.filter((c) => c.id !== 'all'),
];

function withDistanceFrom(user, list) {
  if (!user) return list;
  return list.map((p) => {
    const d = haversineMiles(user, p.coordinate);
    return d != null ? { ...p, distanceMi: d } : p;
  });
}

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef();
  const {
    savedSpots,
    submittedSpots,
    recordedRoutes,
    settings,
    toggleSpot,
    isSpotSaved,
    submitSpot,
    updateSetting,
  } = useApp();

  const [region, setRegion] = useState(SAN_DIEGO);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [livePois, setLivePois] = useState(null); // null = use seed
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addSpot, setAddSpot] = useState({ visible: false, coordinate: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loc = await getCurrentLocation();
      if (cancelled || !loc) return;
      setUser(loc);
      setRegion(loc);
      mapRef.current?.animateToRegion(loc, 600);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset live data when category changes; fetch when applicable.
  useEffect(() => {
    let cancelled = false;
    setLivePois(null);
    if (category === 'all' || category === 'saved' || !hasPlacesKey()) return;
    (async () => {
      setLoading(true);
      const live = await fetchNearbyPOIs({
        category,
        latitude: region.latitude,
        longitude: region.longitude,
      });
      if (!cancelled) {
        setLivePois(live && live.length ? live : null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // region intentionally omitted: refetching on every pan would be wasteful and noisy.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Recompute the working POI list cheaply when its real inputs change.
  const pois = useMemo(() => {
    if (category === 'saved') return withDistanceFrom(user, savedSpots);
    if (category === 'all') return withDistanceFrom(user, [...mockPOIs, ...submittedSpots]);
    if (livePois) return withDistanceFrom(user, livePois);
    const seed = [...mockPOIs, ...submittedSpots].filter((p) => p.category === category);
    return withDistanceFrom(user, seed);
  }, [category, user, savedSpots, submittedSpots, livePois]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pois;
    return pois.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, pois]);

  const recenter = useCallback(() => {
    if (user) mapRef.current?.animateToRegion(user, 400);
  }, [user]);

  const startActivityFromPOI = useCallback(
    (p) => {
      setSelected(null);
      navigation.navigate('ActivityTracking', {
        activity: {
          title: p.name,
          type:
            p.category === 'trails'
              ? 'hiking'
              : p.category === 'gyms'
              ? 'weightLifting'
              : 'running',
          image:
            p.photo ||
            'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=80',
        },
      });
    },
    [navigation]
  );

  const heatmapEnabled = settings.heatmapEnabled;
  const privacyZone = settings.privacyZone;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        onLongPress={(e) => setAddSpot({ visible: true, coordinate: e.nativeEvent.coordinate })}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {filtered.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coordinate}
            tracksViewChanges={false}
            onPress={() => setSelected(p)}
          >
            <POIMarker category={p.category} />
          </Marker>
        ))}

        {heatmapEnabled
          ? recordedRoutes.map((r) => (
              <Polyline
                key={r.id}
                coordinates={r.coordinates}
                strokeColor={colors.accent}
                strokeWidth={3}
                lineCap="round"
              />
            ))
          : null}

        {privacyZone?.enabled ? (
          <Circle
            center={privacyZone.center}
            radius={privacyZone.radiusMi * 1609.34}
            fillColor="rgba(74,123,183,0.12)"
            strokeColor="rgba(74,123,183,0.5)"
            strokeWidth={1}
          />
        ) : null}
      </MapView>

      <View style={[styles.topOverlay, { paddingTop: insets.top + 6 }]}>
        <HeaderBar
          onMenu={() => navigation.openDrawer?.()}
          title={strings.map.title}
          rightIcon="layers-outline"
          onRight={() => updateSetting('heatmapEnabled', !heatmapEnabled)}
          background="transparent"
        />
        <View style={styles.searchWrap}>
          <SearchField
            variant="plain"
            value={query}
            onChangeText={setQuery}
            placeholder={strings.map.searchPlaceholder}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {ALL_FILTERS.map((c) => (
            <POIFilterChip
              key={c.id}
              label={c.label}
              icon={c.icon}
              active={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>
        {loading ? (
          <View style={styles.loading} accessibilityLiveRegion="polite">
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>{strings.map.searchingNearby}</Text>
          </View>
        ) : null}
        {heatmapEnabled ? (
          <View style={styles.heatmapBadge}>
            <Ionicons name="layers" size={14} color={colors.white} />
            <Text style={styles.heatmapText}>{strings.map.heatmapBadge(recordedRoutes.length)}</Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.recenter, { bottom: insets.bottom + 110 }]}
        onPress={recenter}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Recenter map on my location"
      >
        <Ionicons name="locate" size={22} color={colors.accent} />
      </TouchableOpacity>

      {!hasPlacesKey() && category !== 'all' && category !== 'saved' && (
        <View style={[styles.banner, { bottom: insets.bottom + 170 }]}>
          <Text style={styles.bannerText}>{strings.map.seedDataNotice}</Text>
        </View>
      )}

      {selected ? (
        <POIDetailSheet
          poi={selected}
          saved={isSpotSaved(selected.id)}
          onClose={() => setSelected(null)}
          onToggleSave={() => toggleSpot(selected)}
          onViewDetails={() => {
            const poi = selected;
            setSelected(null);
            navigation.navigate('TrailDetail', { poi });
          }}
          onStartActivity={() => startActivityFromPOI(selected)}
        />
      ) : null}

      <AddSpotModal
        visible={addSpot.visible}
        coordinate={addSpot.coordinate}
        onCancel={() => setAddSpot({ visible: false, coordinate: null })}
        onSubmit={(spot) => {
          submitSpot(spot);
          setAddSpot({ visible: false, coordinate: null });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  topOverlay: { position: 'absolute', left: 0, right: 0, top: 0 },
  searchWrap: { paddingHorizontal: spacing.base },
  chips: { paddingHorizontal: spacing.base, paddingVertical: spacing.m },
  recenter: {
    position: 'absolute',
    right: spacing.base,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
    ...shadows.cardLight,
  },
  loadingText: { ...typography.bodySmall, color: colors.textSecondary, marginLeft: spacing.s },
  heatmapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.m,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.xs,
  },
  heatmapText: { ...typography.caption, color: colors.white, marginLeft: 4, fontWeight: '500' },
  banner: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: radius.s,
    ...shadows.cardLight,
  },
  bannerText: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
