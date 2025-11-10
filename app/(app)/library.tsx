// app/(app)/library.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Song = { id: string; title: string; artist: string; cover: string; liked?: boolean };
type Playlist = { id: string; name: string; cover: string; count: number };

const LIKED_SONGS: Song[] = [
  { id: "s1", title: "Levitating", artist: "Dua Lipa", cover: "https://picsum.photos/seed/s1/200", liked: true },
  { id: "s2", title: "As It Was", artist: "Harry Styles", cover: "https://picsum.photos/seed/s2/200", liked: true },
  { id: "s3", title: "Flowers", artist: "Miley Cyrus", cover: "https://picsum.photos/seed/s3/200", liked: true },
  { id: "s4", title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://picsum.photos/seed/s4/200", liked: true },
];

const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Daily Mix 1", cover: "https://picsum.photos/seed/p1/300", count: 42 },
  { id: "p2", name: "Chill Vibes", cover: "https://picsum.photos/seed/p2/300", count: 27 },
  { id: "p3", name: "Workout Pump", cover: "https://picsum.photos/seed/p3/300", count: 35 },
  { id: "p4", name: "Focus Beats", cover: "https://picsum.photos/seed/p4/300", count: 18 },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [query] = useState("");

  const filteredLiked = useMemo(
    () =>
      LIKED_SONGS.filter(
        (s) =>
          (s.title + s.artist).toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      {/* Header */}
      <View
  style={{
    alignItems: "center",
    justifyContent: "center",
          // giảm khoảng cách trên
    paddingBottom: 10,      // giữ khoảng cách dưới để cân đối
    backgroundColor: "#121212",
    borderBottomColor: "#1f1f1f",
    borderBottomWidth: 0.5,
  }}
>
  <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
    Bộ Sưu Tập
  </Text>
</View>


      <FlatList
        data={[{ key: "liked" }, { key: "playlists" }]}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (item.key === "liked") {
            // ===== Bài hát yêu thích (giống Spotify: list dọc) =====
            return (
              <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name="heart" size={18} color="#A855F7" />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: "white",
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    Bài hát yêu thích
                  </Text>
                </View>

                <FlatList
                  data={filteredLiked}
                  keyExtractor={(s) => s.id}
                  ItemSeparatorComponent={() => (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#1f1f1f",
                        marginVertical: 6,
                      }}
                    />
                  )}
                  renderItem={({ item: s }) => (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/playingscreen",
                          params: { id: String(s.id) },
                        })
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 6,
                      }}
                    >
                      <Image
                        source={{ uri: s.cover }}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 6,
                          marginRight: 12,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "white",
                            fontSize: 15,
                            fontWeight: "700",
                          }}
                          numberOfLines={1}
                        >
                          {s.title}
                        </Text>
                        <Text
                          style={{ color: "#9ca3af", marginTop: 3 }}
                          numberOfLines={1}
                        >
                          {s.artist}
                        </Text>
                      </View>
                      <Ionicons
                        name="heart"
                        size={18}
                        color="#A855F7"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            );
          }

          // ===== Playlist của bạn (giống Spotify: lưới 2 cột card) =====
          return (
            <View style={{ paddingHorizontal: 16, paddingTop: 22 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Ionicons name="albums-outline" size={18} color="#60A5FA" />
                <Text
                  style={{
                    marginLeft: 8,
                    color: "white",
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  Playlist của bạn
                </Text>
              </View>

              <FlatList
                data={PLAYLISTS}
                numColumns={2}
                keyExtractor={(p) => p.id}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                contentContainerStyle={{ paddingTop: 4 }}
                renderItem={({ item: p }) => (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    // onPress={() =>
                    //     router.push(`/(app)/playlistdetail?id=${p.id}`)
                    // }

                    style={{
                      width: "48%",
                      marginBottom: 14,
                      backgroundColor: "#1b1b1b",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={{ uri: p.cover }}
                      style={{ width: "100%", height: 120 }}
                    />
                    <View style={{ padding: 10 }}>
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "700",
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                      <Text
                        style={{ color: "#9ca3af", marginTop: 3, fontSize: 12 }}
                      >
                        {p.count} bài hát
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
