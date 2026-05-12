import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { logger } from '../services/logger';
import { colors, spacing, radius, typography } from '../theme';
import { strings } from '../i18n/strings';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    logger.error(error, { componentStack: info?.componentStack });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.root} accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <Text style={styles.title}>{strings.errors.unexpectedTitle}</Text>
        <Text style={styles.body}>{strings.errors.unexpectedBody}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel={strings.errors.tryAgain}
        >
          <Text style={styles.btnLabel}>{strings.errors.tryAgain}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: { ...typography.h2, color: colors.white, textAlign: 'center', marginBottom: spacing.m },
  body: {
    ...typography.body,
    color: colors.white,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: radius.pill,
  },
  btnLabel: { ...typography.labelCaps, color: colors.white },
});
