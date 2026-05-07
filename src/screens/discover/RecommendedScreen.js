import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import ActivityCard from '../../components/ActivityCard';
import { recommendedActivities } from '../../data/mockActivities';
import { colors, spacing } from '../../theme';

export default function RecommendedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <HeaderBar onBack={() => navigation.goBack()} title="Recommended" bordered />
      <ScrollView contentContainerStyle={styles.scroll}>
        {recommendedActivities.map((a) => (
          <ActivityCard
            key={a.id}
            variant="wide"
            title={a.title}
            sublabel={a.sublabel}
            image={a.image}
            height={200}
            onPress={() => navigation.navigate('ActivityTracking', { activity: a })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceMuted },
  scroll: { padding: spacing.base, paddingBottom: 120 },
});
