import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import HeaderBar from '../../components/HeaderBar';
import SearchField from '../../components/SearchField';
import MessageListItem from '../../components/MessageListItem';
import { conversations } from '../../data/mockMessages';
import { colors, spacing } from '../../theme';

export default function InboxScreen({ navigation }) {
  const [query, setQuery] = useState('');

  const filtered = conversations.filter((c) => {
    const name = `${c.participant.firstName} ${c.participant.lastName}`.toLowerCase();
    return name.includes(query.toLowerCase()) || c.lastMessage.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        onBack={() => navigation.goBack()}
        title="Inbox"
        rightIcon="create-outline"
        onRight={() => {}}
        bordered
      />
      <View style={styles.searchWrap}>
        <SearchField
          variant="plain"
          value={query}
          onChangeText={setQuery}
          placeholder="Search Messages"
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
  container: { flex: 1, backgroundColor: colors.surface },
  searchWrap: { padding: spacing.base, backgroundColor: colors.surface },
});
