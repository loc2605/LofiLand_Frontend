import SearchBar from "@/components/SearchBar";
import axiosInstance from "@/utils/axiosInstance";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Song = {
  id: string;
  title: string;
  artist: { id: string; name: string; avatarUrl?: string };
  album: { id: string; title: string; coverUrl?: string };
  audioUrl?: string;
  fullUrl?: string;
};
type Album = { id: string; title: string; artist: { id: string; name: string }; coverUrl: string };
type Artist = { id: string; name: string; avatarUrl: string };
type FilterType = "all" | "tracks" | "albums" | "artists";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    tracks: Song[];
    albums: Album[];
    artists: Artist[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // API search
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/deezer/search?query=${encodeURIComponent(query)}`);
      const { tracks = [], albums = [], artists = [] } = res.data;
      setSearchResults({
        tracks: tracks.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          artist: { id: t.artist?.id?.toString() || "", name: t.artist?.name || "", avatarUrl: t.artist?.avatarUrl || "" },
          album: { id: t.album?.id?.toString() || "", title: t.album?.title || "", coverUrl: t.album?.coverUrl || "" },
          audioUrl: t.audioUrl,
          fullUrl: t.fullUrl,
        })),
        albums: albums.map((a: any) => ({
          id: a.id.toString(),
          title: a.title,
          artist: { id: a.artist?.id?.toString() || "", name: a.artist?.name || "" },
          coverUrl: a.coverUrl,
        })),
        artists: artists.map((ar: any) => ({
          id: ar.id.toString(),
          name: ar.name,
          avatarUrl: ar.avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }))
      });
    } catch (err) {
      console.log(err);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const onPressCategory = async (title: string) => {
    setSearchQuery(title);
    await handleSearch(title);
    Keyboard.dismiss();
  };

  const unified = searchResults
    ? [
        ...(filter === "all" || filter === "tracks" ? searchResults.tracks.map((t) => ({ type: "track" as const, data: t })) : []),
        ...(filter === "all" || filter === "albums" ? searchResults.albums.map((a) => ({ type: "album" as const, data: a })) : []),
        ...(filter === "all" || filter === "artists" ? searchResults.artists.map((ar) => ({ type: "artist" as const, data: ar })) : [])
      ]
    : [];

  const renderSearchResult = ({ item }: any) => {
    if (item.type === "track") {
      const t = item.data;
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/playingscreen",
              params: { id: String(t.id), playlist: JSON.stringify(searchResults!.tracks) }
            })
          }
          style={styles.resultItem}
        >
          <Image source={{ uri: t.album.coverUrl || "https://placehold.co/80x80" }} style={styles.resultImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>{t.title}</Text>
            <Text style={styles.resultSubtitle}>{t.artist.name}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    if (item.type === "album") {
      const a = item.data;
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/albumdetail",
              params: { albumId: a.id, albumTitle: a.title, albumArtist: a.artist.name, albumCover: a.coverUrl }
            })
          }
          style={styles.resultItem}
        >
          <Image source={{ uri: a.coverUrl }} style={styles.resultImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>{a.title}</Text>
            <Text style={styles.resultSubtitle}>{a.artist.name}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    const ar = item.data;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(app)/artistdetail",
            params: { artistId: ar.id, artistName: ar.name, artistImage: ar.avatarUrl }
          })
        }
        style={styles.resultItem}
      >
        <Image source={{ uri: ar.avatarUrl }} style={styles.artistImage} />
        <View style={{ flex: 1 }}>
          <Text style={styles.resultTitle}>{ar.name}</Text>
          <Text style={styles.resultSubtitle}>Nghệ sĩ</Text>
        </View>
      </TouchableOpacity>
    );
  };

const categories = [
  { title: "Nhạc Việt", color: "#64748B", img: "https://images.pexels.com/photos/210804/pexels-photo-210804.jpeg" },
  { title: "Pop", color: "#164815ff", img: "https://images.pexels.com/photos/442540/pexels-photo-442540.jpeg" },
  { title: "K-Pop", color: "#DC2626", img: "https://media.istockphoto.com/id/1484810402/vi/anh/k-pop-h%C3%A0n-qu%E1%BB%91c-%C3%A2m-nh%E1%BA%A1c-neon-%C3%A1nh-s%C3%A1ng-3d-minh-h%E1%BB%8Da.jpg?b=1&s=612x612&w=0&k=20&c=Mz33nEpFNwvcDrWBND0ikWFiaGeVURo03h_QK4AQNqo=" },
  { title: "Hip-Hop", color: "#F97316", img: "https://images.pexels.com/photos/159613/ghettoblaster-radio-recorder-boombox-old-school-159613.jpeg" },
  { title: "R&B", color: "#F59E0B", img: "https://media.istockphoto.com/id/1717757192/vi/anh/piano-acoustic-tr%C3%AAn-s%C3%A2n-kh%E1%BA%A5u-t%E1%BA%A1i-qu%E1%BA%A7y-bar-ngay-tr%C6%B0%E1%BB%9Bc-%C4%91%C3%AAm-di%E1%BB%85n-2023.jpg?b=1&s=612x612&w=0&k=20&c=Cphmy448LizpF0untdOPS_BphwfH8y9V6uguWSduad8=" },
  { title: "Electronic", color: "#10B981", img: "https://images.unsplash.com/photo-1544785349-c4a5301826fd?crop=entropy&cs=tinysrgb&fit=max&w=400&h=400" },
  { title: "Rock", color: "#EF4444", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&w=400&h=400" },
  { title: "Jazz", color: "#8B5CF6", img: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?crop=entropy&cs=tinysrgb&fit=max&w=400&h=400" },
  { title: "Lofi", color: "#6366F1", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?crop=entropy&cs=tinysrgb&fit=max&w=400&h=400" },
  { title: "Classical", color: "#FBBF24", img: "https://images.unsplash.com/photo-1511376777868-611b54f68947?crop=entropy&cs=tinysrgb&fit=max&w=400&h=400" }
];

  const filters: { label: string; value: FilterType }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Bài hát", value: "tracks" },
    { label: "Album", value: "albums" },
    { label: "Nghệ sĩ", value: "artists" }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => {
            setSearchQuery("");
            setSearchResults(null);
            Keyboard.dismiss();
          }}
        />
        {searchQuery !== "" && (
          <View style={styles.filters}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.filterBtn, filter === f.value && styles.filterActive]}
                onPress={() => setFilter(f.value)}
              >
                <Text style={styles.filterText}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#9747FF" />
        </View>
      ) : searchQuery === "" ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Duyệt tìm tất cả</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.categoryCard, { backgroundColor: item.color }]}
                onPress={() => onPressCategory(item.title)}
              >
                <Text style={styles.categoryTitle}>{item.title}</Text>
                {item.img && <Image source={{ uri: item.img }} style={styles.categoryImage} />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={unified}
          keyExtractor={(i) => `${i.type}_${i.data.id}`}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có kết quả</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 12, borderBottomColor: "#1F1F1F", borderBottomWidth: 0.5 },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  searchWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  filters: { flexDirection: "row", marginTop: 8, marginBottom: 8 },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#272727", borderRadius: 20, marginRight: 8 },
  filterActive: { backgroundColor: "#9747FF" },
  filterText: { color: "white", fontWeight: "600" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  categoriesContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  categoriesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryCard: { width: '48%', height: 130, marginBottom: 16, borderRadius: 12, padding: 12, justifyContent: 'flex-start', overflow: 'hidden' },
  categoryTitle: { color: "white", fontSize: 17, fontWeight: "700" },
  categoryImage: { width: 80, height: 80, position: 'absolute', bottom: -3, right: -3, borderRadius: 8, transform: [{ rotate: '-15deg' }] },
  resultsList: { paddingHorizontal: 16, paddingBottom: 20 },
  resultItem: { flexDirection: "row", paddingVertical: 10, alignItems: "center" },
  resultImage: { width: 50, height: 50, borderRadius: 6, marginRight: 12 },
  artistImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  resultTitle: { color: "white", fontSize: 15, fontWeight: "600" },
  resultSubtitle: { color: "#9ca3af", marginTop: 3 },
  emptyText: { color: "#9ca3af", paddingVertical: 12 }
});
