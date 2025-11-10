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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Artist = {
  id: string;
  name: string;
  avatar: string;
  views: string;   // 86.0M lượt xem
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
  { id: "a2", name: "Hiếu Organ",        avatar: "https://picsum.photos/seed/a2/300", views: "48.7M", rank: 2 },
  { id: "a3", name: "Phương Mỹ Chi",     avatar: "https://picsum.photos/seed/a3/300", views: "38.3M", rank: 3 },
  { id: "a4", name: "SOOBIN",            avatar: "https://picsum.photos/seed/a4/300", views: "33.6M", rank: 4 },
  { id: "a5", name: "DTAP",              avatar: "https://picsum.photos/seed/a5/300", views: "31.4M", rank: 5 },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      {/* Header gọn, đặt cao như yêu cầu */}
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingTop: 4,
          paddingBottom: 10,
          height: 56,
          backgroundColor: "#121212",
          borderBottomColor: "#1f1f1f",
          borderBottomWidth: 0.5,
        }}
      >
        <Text style={{ color: "white", fontSize: 22, fontWeight: "800" }}>
          Thịnh hành
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* ============== Nghệ sĩ hàng đầu ============== */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
            Nghệ sĩ hàng đầu
          </Text>
          <Text style={{ color: "#a1a1aa", marginTop: 4, fontSize: 12 }}>
            Việt Nam · 23 thg 6 – 20 thg 7, 2025
          </Text>

          <FlatList
            horizontal
            data={TOP_ARTISTS}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 16, paddingRight: 8 }}
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
                style={{ alignItems: "center", width: 110 }}
              >
                {/* Avatar tròn + hạng overlay */}
                <View style={{ width: 96, height: 96 }}>
                  <Image
                    source={{ uri: item.avatar }}
                    style={{ width: 96, height: 96, borderRadius: 48 }}
                  />
                  <View
                    style={{
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
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "800", fontSize: 12 }}>
                      {item.rank}
                    </Text>
                  </View>
                </View>

                <Text
                  numberOfLines={1}
                  style={{
                    color: "white",
                    marginTop: 8,
                    fontWeight: "700",
                    width: 100,
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  {item.name}
                </Text>
                <Text style={{ color: "#a1a1aa", fontSize: 11, marginTop: 2 }}>
                  {item.views} lượt xem
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ============== Các bài hát hàng đầu ============== */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>
            Các bài hát hàng đầu
          </Text>
          <Text style={{ color: "#a1a1aa", marginTop: 4, fontSize: 12 }}>
            Việt Nam · 23 thg 6 – 20 thg 7, 2025
          </Text>

          {/* Grid 2 cột thân thiện mobile */}
          <View style={{ marginTop: 12, rowGap: 14 }}>
            {chunk(TOP_SONGS, 2).map((row) => (
              <View key={row[0].id} style={{ flexDirection: "row", columnGap: 14 }}>
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
                    style={{
                      flex: 1,
                      backgroundColor: "#1a1a1a",
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    {/* Ảnh + rank corner */}
                    <View>
                      <Image
                        source={{ uri: song.cover }}
                        style={{ width: "100%", height: (width - 16 * 2 - 14) / 2 }}
                      />
                      <View
                        style={{
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
                        }}
                      >
                        <Ionicons name="trophy-outline" size={14} color="#FBBF24" />
                        <Text style={{ color: "#FBBF24", fontWeight: "800", fontSize: 12 }}>
                          {song.rank}
                        </Text>
                      </View>
                    </View>

                    {/* Thông tin */}
                    <View style={{ padding: 10 }}>
                      <Text
                        numberOfLines={1}
                        style={{ color: "white", fontWeight: "700", fontSize: 14 }}
                      >
                        {song.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={{ color: "#a1a1aa", marginTop: 2, fontSize: 12 }}
                      >
                        {song.artist}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 6,
                          gap: 6,
                        }}
                      >
                        <Ionicons name="eye-outline" size={14} color="#9ca3af" />
                        <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                          {song.views} lượt xem
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
                {/* Nếu số lượng lẻ thì chèn box rỗng để căn đều */}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** chia mảng thành các nhóm n phần tử (ở đây là 2 cho grid) */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
