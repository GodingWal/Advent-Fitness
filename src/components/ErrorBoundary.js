import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import { logger } from '../services/logger';
import { colors, spacing, typography } from '../theme';
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
        <Text style={styles.title}>
          {strings.errors.unexpectedTitle}
          <Text style={{ color: colors.accent }}>.</Text>
        </Text>
        <Text style={styles.body}>{strings.errors.unexpectedBody}</Text>
        <PrimaryButton
          label={strings.errors.tryAgain}
          onPress={this.reset}
          trailingIcon="refresh"
          style={styles.btn}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  body: {
    ...typography.body,
    color: colors.textMute,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  btn: { minWidth: 220 },
});
