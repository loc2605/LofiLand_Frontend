import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../utils/axiosInstance';
import Markdown from 'react-native-markdown-display';

type Song = {
  id: string;
  title: string;
  artist: { name: string };
  album: { coverUrl: string };
  audioUrl: string;
  duration?: number;
  link?: string;
};

type Message = { id: string; from: 'user' | 'ai'; text: string; songs?: Song[] };

const SCREEN_WIDTH = Dimensions.get('window').width;

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const userAvatar =
    (params.avatarUrl as string) ||
    'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-ai',
      from: 'ai',
      text: 'Xin chào! Tôi là Gemini AI. Tôi có thể giúp gì cho bạn hôm nay?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: inputText,
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const typingMsg: Message = {
      id: `typing-${Date.now()}`,
      from: 'ai',
      text: '...',
    };
    setMessages(prev => [...prev, typingMsg]);
    scrollToEnd();

    try {
      const res = await axiosInstance.post('/api/ai/chat', { prompt: userMsg.text });
      const aiText = (res.data.output || 'Xin lỗi, tôi không hiểu.').trim();
      const songs: Song[] = res.data.songs || [];

      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMsg.id ? { ...msg, text: aiText, songs } : msg
        )
      );
      scrollToEnd();
    } catch (err) {
      console.error('FE chat error:', err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === typingMsg.id
            ? { ...msg, text: 'Có lỗi xảy ra. Thử lại sau.' }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = (song: Song, playlist: Song[]) => {
    // encode playlist thành string JSON để truyền sang Playingscreen
    const encodedPlaylist = encodeURIComponent(JSON.stringify(playlist));
    router.push({
      pathname: '/playingscreen',
      params: { id: song.id, playlist: encodedPlaylist },
    });
  };

  const renderSongItem = (song: Song, playlist: Song[]) => (
    <TouchableOpacity
      key={song.id}
      style={styles.songItem}
      onPress={() => handlePlaySong(song, playlist)}
    >
      <Image source={{ uri: song.album.coverUrl }} style={styles.songCover} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.songArtist}>{song.artist.name}</Text>
      </View>
      <Ionicons name="play-circle" size={32} color="#9747FF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Chat với AI</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={{ marginBottom: 12 }}>
                <View
                  style={[
                    styles.messageRow,
                    item.from === 'user' ? styles.rowRight : styles.rowLeft,
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        item.from === 'user'
                          ? userAvatar
                          : 'https://thumbs.dreamstime.com/b/artificial-intelligence-icon-ai-three-stars-logo-application-website-flat-vector-illustration-eps-371594668.jpg',
                    }}
                    style={styles.avatar}
                  />
                  <View
                    style={[
                      styles.bubble,
                      item.from === 'user' ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Markdown
                      style={{
                        body: styles.text,
                        paragraph: { marginTop: 0, marginBottom: 6, lineHeight: 20 },
                      }}
                    >
                      {item.text}
                    </Markdown>
                  </View>
                </View>

                {item.songs && item.songs.length > 0 && (
                  <View style={styles.songList}>
                    {item.songs.map((song: any) => renderSongItem(song, item.songs!))}
                  </View>
                )}
              </View>
            )}
          />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 40} // giảm xuống cho gần bàn phím
      >
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#AAA"
            style={styles.input}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

        </View>
      </TouchableWithoutFeedback>

    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    position: 'relative',
  },
  rowLeft: { alignSelf: 'flex-start' },
  rowRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },

  avatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 4 },

  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    maxWidth: SCREEN_WIDTH * 0.7,
    flexShrink: 1,
  },
  userBubble: { backgroundColor: '#9747FF', alignSelf: 'flex-end', borderTopRightRadius: 0 },
  aiBubble: { backgroundColor: '#333', alignSelf: 'flex-start', borderTopLeftRadius: 0 },

  text: { color: '#FFF', lineHeight: 20 },

  inputContainer: { flexDirection: 'row', padding: 10, borderTopColor: '#333', borderTopWidth: 1 },
  input: {
    flex: 1,
    backgroundColor: '#222',
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 40,
    maxHeight: 120,
    textAlignVertical: 'center',
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#9747FF',
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  songList: {
    marginTop: 6,
    paddingHorizontal: 10,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  songCover: { width: 50, height: 50, borderRadius: 6 },
  songTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  songArtist: { color: '#AAA', fontSize: 14 },
});
