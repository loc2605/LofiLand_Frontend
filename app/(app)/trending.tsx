// app/(app)/trending.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Artist = {
  id: string;
  name: string;
  avatar: string;
  views: string;
  rank: number;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  views: string;
  rank: number;
};

const TOP_ARTISTS: Artist[] = [
  { id: "a1", name: `EM XINH "SAY HI"`, avatar: "https://picsum.photos/seed/a1/300", views: "86.0M", rank: 1 },
  { id: "a2", name: "Hiếu Organ", avatar: "https://picsum.photos/seed/a2/300", views: "48.7M", rank: 2 },
  { id: "a3", name: "Phương Mỹ Chi", avatar: "https://picsum.photos/seed/a3/300", views: "38.3M", rank: 3 },
  { id: "a4", name: "SOOBIN", avatar: "https://picsum.photos/seed/a4/300", views: "33.6M", rank: 4 },
  { id: "a5", name: "DTAP", avatar: "https://picsum.photos/seed/a5/300", views: "31.4M", rank: 5 },
  { id: "a6", name: `ANH TRAI "SAY HI"`, avatar: "https://picsum.photos/seed/a6/300", views: "26.0M", rank: 6 },
];

const TOP_SONGS: Song[] = [
  { id: "s1", title: "GÁ SẮN CÁ", artist: `EM XINH "SAY HI"`, cover: "https://picsum.photos/seed/s1/200", views: "17.2M", rank: 1 },
  { id: "s2", title: "Bắc Bling (Bắc Ninh)", artist: "Hòa Minzy, NSUT Xuan Hanh & Tuấn Cry", cover: "https://picsum.photos/seed/s2/200", views: "16.5M", rank: 2 },
  { id: "s3", title: "Tiến Tới Ước Mơ 2", artist: "Vươn Mình Vượt Trội", cover: "https://picsum.photos/seed/s3/200", views: "13.4M", rank: 3 },
  { id: "s4", title: "Bông Phù Hoa (Live)", artist: "Phương Mỹ Chi & DTAP", cover: "https://picsum.photos/seed/s4/200", views: "13.6M", rank: 4 },
  { id: "s5", title: "Dirty Work", artist: "aespa", cover: "https://picsum.photos/seed/s5/200", views: "9.65M", rank: 5 },
  { id: "s6", title: "KHÔNG ĐAU NỮA RỒI", artist: `EM XINH "SAY HI"`, cover: "https://picsum.photos/seed/s6/200", views: "11.7M", rank: 6 },
  { id: "s7", title: "All The Stars", artist: "Kendrick Lamar", cover: "https://picsum.photos/seed/s7/200", views: "8.1M", rank: 7 },
  { id: "s8", title: "Love In The Future", artist: "John Legend", cover: "https://picsum.photos/seed/s8/200", views: "7.9M", rank: 8 },
];

const { width } = Dimensions.get("window");

export default function TrendingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thịnh hành</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* ===== Nghệ sĩ hàng đầu ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nghệ sĩ hàng đầu</Text>
          <Text style={styles.sectionSubtitle}>Việt Nam · 23 thg 6 – 20 thg 7, 2025</Text>

          <FlatList
            horizontal
            data={TOP_ARTISTS}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistList}
            ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/artistdetail",
                    params: { artistId: item.id, artistName: item.name, artistImage: item.avatar },
                  })
                }
                style={styles.artistCard}
              >
                <View style={styles.artistAvatarWrapper}>
                  <Image source={{ uri: item.avatar }} style={styles.artistAvatar} />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{item.rank}</Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={styles.artistName}>{item.name}</Text>
                <Text style={styles.artistViews}>{item.views} lượt xem</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ===== Bài hát hàng đầu ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các bài hát hàng đầu</Text>
          <Text style={styles.sectionSubtitle}>Việt Nam · 23 thg 6 – 20 thg 7, 2025</Text>

          <View style={styles.songGrid}>
            {chunk(TOP_SONGS, 2).map((row) => (
              <View key={row[0].id} style={styles.songRow}>
                {row.map((song) => (
                  <TouchableOpacity
                    key={song.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/playingscreen",
                        params: { id: String(song.id) },
                      })
                    }
                    style={styles.songCard}
                  >
                    <View>
                      <Image source={{ uri: song.cover }} style={styles.songImage} />
                      <View style={styles.rankCorner}>
                        <Ionicons name="trophy-outline" size={14} color="#FBBF24" />
                        <Text style={styles.rankCornerText}>{song.rank}</Text>
                      </View>
                    </View>
                    <View style={styles.songInfo}>
                      <Text numberOfLines={1} style={styles.songTitle}>{song.title}</Text>
                      <Text numberOfLines={1} style={styles.songArtist}>{song.artist}</Text>
                      <View style={styles.songViews}>
                        <Ionicons name="eye-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.songViewsText}>{song.views} lượt xem</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomColor: "#1F1F1F",
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    color: "#9CA3AF",
    marginTop: 4,
    fontSize: 13,
  },
  artistList: {
    paddingVertical: 16,
    paddingRight: 8,
  },
  artistCard: {
    alignItems: "center",
    width: 110,
  },
  artistAvatarWrapper: {
    width: 96,
    height: 96,
  },
  artistAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  rankBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  rankText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  artistName: {
    color: "#FFFFFF",
    marginTop: 8,
    fontWeight: "700",
    width: 100,
    textAlign: "center",
    fontSize: 14,
  },
  artistViews: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  songGrid: {
    marginTop: 12,
    rowGap: 14,
  },
  songRow: {
    flexDirection: "row",
    columnGap: 14,
  },
  songCard: {
    flex: 1,
    backgroundColor: "#1B1B1B",
    borderRadius: 12,
    overflow: "hidden",
  },
  songImage: {
    width: "100%",
    height: (width - 16 * 2 - 14) / 2,
  },
  rankCorner: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rankCornerText: {
    color: "#FBBF24",
    fontWeight: "800",
    fontSize: 12,
  },
  songInfo: {
    padding: 10,
  },
  songTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  songArtist: {
    color: "#9CA3AF",
    marginTop: 2,
    fontSize: 14,
  },
  songViews: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  songViewsText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
});
