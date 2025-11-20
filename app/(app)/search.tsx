import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  plays: string;
  duration: string;
  genre: string;
};

const GENRES = ["Pop", "Hip Hop", "EDM", "Rock", "Indie", "R&B", "Lo-fi"];

const MOCK: Track[] = [
  { id: "1", title: "Me", artist: "Jessica Gonzalez", cover: "https://picsum.photos/seed/1/80", plays: "2,1M", duration: "3:36", genre: "Pop" },
  { id: "2", title: "Me Inc", artist: "Anthony Taylor", cover: "https://picsum.photos/seed/2/80", plays: "68M", duration: "3:35", genre: "EDM" },
  { id: "3", title: "Dozz me", artist: "Brian Bailey", cover: "https://picsum.photos/seed/3/80", plays: "93M", duration: "4:39", genre: "Hip Hop" },
];

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState("me");
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const data = useMemo(() => {
    const qLower = q.toLowerCase();
    return MOCK.filter((t) => {
      const textMatch = (t.title + t.artist).toLowerCase().includes(qLower);
      const genreMatch = activeGenre ? t.genre === activeGenre : true;
      return textMatch && genreMatch;
    });
  }, [q, activeGenre]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      {/* Ô tìm kiếm + nút Filter */}
      <View style={{ padding: 16, flexDirection: "row", gap: 10 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1f1f1f",
            borderRadius: 12,
            paddingHorizontal: 12,
            height: 44,
          }}
        >
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Tìm bài hát, nghệ sĩ…"
            placeholderTextColor="#8b8b8b"
            style={{ color: "white", marginLeft: 8, flex: 1 }}
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ("")}>
              <Ionicons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Nút Filter (placeholder) */}
        <TouchableOpacity
          onPress={() => {
            // bạn có thể mở modal nâng cao ở đây
            setActiveGenre(null);
            setQ("");
          }}
          style={{
            height: 44,
            paddingHorizontal: 14,
            borderRadius: 12,
            backgroundColor: "#00B3C9",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 6,
          }}
        >
          <Ionicons name="filter" size={16} color="white" />
          <Text style={{ color: "white", fontWeight: "700" }}>Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Hot topics / Thể loại (chips) */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
          Thể loại nổi bật
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {GENRES.map((g) => {
              const active = activeGenre === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setActiveGenre(active ? null : g)}
                  style={{
                    paddingHorizontal: 12,
                    height: 34,
                    borderRadius: 17,
                    borderWidth: 1,
                    borderColor: active ? "#7C3AED" : "#2a2a2a",
                    backgroundColor: active ? "rgba(124,58,237,0.18)" : "#151515",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: active ? "#C4B5FD" : "#cfcfcf", fontWeight: "600" }}>
                    {g}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Categories (tham khảo UI mẫu) */}
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
          Thể loại chi tiết
        </Text>

        {[
          { icon: "musical-notes-outline", label: "Pop" },
          { icon: "flash-outline", label: "Hip Hop" },
          { icon: "rocket-outline", label: "EDM" },
          { icon: "musical-notes-outline", label: "Rock" },
          { icon: "leaf-outline", label: "Indie" },
        ].map((c) => (
          <TouchableOpacity
            key={c.label}
            onPress={() => setActiveGenre(c.label)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 12,
              backgroundColor: "#1a1a1a",
              marginBottom: 10,
            }}
          >
            <Ionicons name={c.icon as any} size={18} color="#8b8b8b" />
            <Text style={{ color: "white", marginLeft: 10, fontWeight: "700", flex: 1 }}>
              {c.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Kết quả */}
      <View style={{ paddingHorizontal: 16, paddingTop: 6, flex: 1 }}>
        <Text style={{ color: "white", fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
          Kết quả
        </Text>

        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: "#1f1f1f" }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(app)/playingscreen",
                  params: { id: String(item.id) },
                })
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
              }}
            >
              <Image
                source={{ uri: item.cover }}
                style={{ width: 52, height: 52, borderRadius: 8, marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#9ca3af", marginTop: 3 }}>
                  {item.artist} • {item.genre}
                </Text>
              </View>
              <Ionicons name="ellipsis-vertical" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af", paddingVertical: 12 }}>
              Không có kết quả phù hợp
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}
