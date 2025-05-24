import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { MessageSquare, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Chat } from '@/types/app';
import { format } from 'date-fns';

interface ChatListProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, activeChat, onSelectChat, onDeleteChat }: ChatListProps) {
  const colorScheme = useColorScheme();

  if (chats.length === 0) {
    return (
      <View style={styles.emptyChatList}>
        <Text style={[
          styles.emptyChatText,
          { color: Colors[colorScheme ?? 'light'].textSecondary }
        ]}>
          No chat history yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.chatList}>
      {chats.map((chat) => (
        <Pressable
          key={chat.id}
          style={[
            styles.chatItem,
            activeChat === chat.id && {
              backgroundColor: Colors[colorScheme ?? 'light'].tintTransparent,
            }
          ]}
          onPress={() => onSelectChat(chat.id)}
        >
          <MessageSquare 
            size={16} 
            color={Colors[colorScheme ?? 'light'].textSecondary} 
          />
          <View style={styles.chatInfo}>
            <Text
              style={[
                styles.chatTitle,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}
              numberOfLines={1}
            >
              {chat.title}
            </Text>
            <Text
              style={[
                styles.chatDate,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}
            >
              {format(chat.createdAt, 'MMM d, yyyy')}
            </Text>
          </View>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDeleteChat(chat.id)}
          >
            <Trash2 
              size={16} 
              color={Colors[colorScheme ?? 'light'].danger} 
            />
          </Pressable>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chatList: {
    flex: 1,
  },
  emptyChatList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyChatText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 2,
  },
  chatDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});