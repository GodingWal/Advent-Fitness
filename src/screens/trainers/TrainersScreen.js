import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import HeaderBar from '../../components/HeaderBar';
import PrimaryButton from '../../components/PrimaryButton';
import { Caps, Mono } from '../../components/VoltPrimitives';
import { mockTrainers } from '../../data/mockTrainers';
import { colors, spacing, radius, typography } from '../../theme';

export default function TrainersScreen({ navigation }) {
  const [hiredIds, setHiredIds] = useState([]);

  const hire = useCallback((trainer) => {
    Alert.alert(
      `Hire ${trainer.shortName}?`,
      `${trainer.specialty} · $${trainer.pricePerSession}/session`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () =>
            setHiredIds((cur) => (cur.includes(trainer.id) ? cur : [...cur, trainer.id])),
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="TRAINERS" />
      <View style={styles.headerRow}>
        <Caps size={10} color={colors.textMute}>
          Personal Training · {mockTrainers.length} available
        </Caps>
        <Text style={styles.h2}>Trainers.</Text>
      </View>
      <FlatList
        data={mockTrainers}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.scroll}
        renderItem={({ item }) => {
          const hired = hiredIds.includes(item.id);
          return (
            <View style={styles.card}>
              <View style={styles.top}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Caps size={9} color={colors.accent}>
                    {item.specialty}
                  </Caps>
                  <Mono size={11} style={{ marginTop: 4 }}>
                    {item.gym}
                  </Mono>
                </View>
              </View>
              <View style={styles.meta}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color={colors.accent} />
                  <Mono size={12} style={{ marginLeft: 4 }}>
                    {item.rating.toFixed(1)}
                  </Mono>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.textMute} />
                  <Mono size={12} style={{ marginLeft: 4 }}>
                    {item.sessions} sessions
                  </Mono>
                </View>
                <View style={styles.metaItem}>
                  <Mono size={12} color={colors.text}>
                    ${item.pricePerSession}/session
                  </Mono>
                </View>
              </View>
              {hired ? (
                <View style={styles.hiredBadge}>
                  <Ionicons name="checkmark" size={14} color="#0A0C10" />
                  <Caps size={10} color="#0A0C10" style={{ marginLeft: 6 }}>
                    Request sent
                  </Caps>
                </View>
              ) : (
                <View style={{ marginTop: spacing.base }}>
                  <PrimaryButton
                    label="Hire"
                    trailingIcon="arrow-forward"
                    onPress={() => hire(item)}
                  />
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { paddingHorizontal: spacing.edge, paddingTop: spacing.s, paddingBottom: spacing.m },
  h2: { ...typography.h2, color: colors.text, marginTop: 4 },
  scroll: { padding: spacing.edge, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.lineSoft,
    padding: spacing.base,
    marginBottom: spacing.m,
  },
  top: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: radius.s },
  info: { flex: 1, marginLeft: spacing.m },
  name: { ...typography.body, fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.m },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.l },
  hiredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    marginTop: spacing.base,
  },
});
