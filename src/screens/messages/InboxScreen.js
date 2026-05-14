import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import SearchField from '../../components/SearchField';
import MessageListItem from '../../components/MessageListItem';
import { Caps } from '../../components/VoltPrimitives';
import { conversations } from '../../data/mockMessages';
import { colors, spacing } from '../../theme';

export default function InboxScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) => {
    const name = `${c.participant.firstName} ${c.participant.lastName}`.toLowerCase();
    return (
      name.includes(query.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
  });

  const unread = conversations.filter((c) => c.unread).length;

  return (
    <View style={styles.container}>
      <HeaderBar
        onBack={() => navigation.goBack()}
        title="INBOX"
        rightIcon="create-outline"
        onRight={() => {}}
      />
      <View style={styles.statRow}>
        <Caps size={10} color={colors.textMute}>
          {unread} unread · {conversations.length} threads
        </Caps>
      </View>
      <View style={styles.searchWrap}>
        <SearchField
          variant="plain"
          value={query}
          onChangeText={setQuery}
          placeholder="Search messages"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageListItem
            conversation={item}
            onPress={() => navigation.navigate('Chat', { friend: item.participant })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statRow: {
    paddingHorizontal: spacing.edge,
    paddingBottom: spacing.s,
  },
  searchWrap: {
    paddingHorizontal: spacing.edge,
    paddingBottom: spacing.base,
  },
});
