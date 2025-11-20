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
  View
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

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    tracks: Song[];
    albums: Album[];
    artists: Artist[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Hàm gọi API
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
          artist: { id: t.artist?.id?.toString() || '', name: t.artist?.name || '' },
          album: { id: t.album?.id?.toString() || '', title: t.album?.title || '', coverUrl: t.album?.coverUrl },
          audioUrl: t.audioUrl,
          fullUrl: t.fullUrl,
        })),
        albums: albums.map((a: any) => ({
          id: a.id.toString(),
          title: a.title,
          artist: { id: a.artist?.id?.toString() || '', name: a.artist?.name || '' },
          coverUrl: a.coverUrl,
        })),
        artists: artists.map((ar: any) => ({
          id: ar.id.toString(),
          name: ar.name,
          avatarUrl: ar.avatarUrl
        }))
      });
    } catch (err) {
      console.log(err);
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Khi bấm vào category
  const onPressCategory = async (title: string) => {
    setSearchQuery(title);
    await handleSearch(title);
    Keyboard.dismiss();
  };

  // Gom tất cả vào 1 danh sách
  const unified = searchResults
    ? [
        ...searchResults.tracks.map((t) => ({ type: "track" as const, data: t })),
        ...searchResults.albums.map((a) => ({ type: "album" as const, data: a })),
        ...searchResults.artists.map((ar) => ({ type: "artist" as const, data: ar }))
      ]
    : [];

  // Render kết quả search
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
          style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center" }}
        >
          <Image
            source={{ uri: t.album.coverUrl || "https://placehold.co/80x80" }}
            style={{ width: 50, height: 50, borderRadius: 6, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>{t.title}</Text>
            <Text style={{ color: "#9ca3af", marginTop: 3 }}>{t.artist.name}</Text>
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
              params: { albumId: a.id }
            })
          }
          style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center" }}
        >
          <Image
            source={{ uri: a.coverUrl }}
            style={{ width: 50, height: 50, borderRadius: 6, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>{a.title}</Text>
            <Text style={{ color: "#9ca3af", marginTop: 3 }}>{a.artist.name}</Text>
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
            params: { artistId: ar.id }
          })
        }
        style={{ flexDirection: "row", paddingVertical: 10, alignItems: "center" }}
      >
        <Image
          source={{ uri: ar.avatarUrl || "https://placehold.co/80x80" }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>{ar.name}</Text>
          <Text style={{ color: "#9ca3af", marginTop: 3 }}>Nghệ sĩ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const categories = [
    { title: "Nhạc", color: "#EC4899", img: "https://cdn2.fptshop.com.vn/unsafe/800x0/hinh_nen_am_nhac_3_e9a7f1d11d.png" },
    { title: "Podcasts", color: "#047857", img: "https://cdn2.fptshop.com.vn/unsafe/800x0/hinh_nen_am_nhac_2_30fcc04fd6.png" },
    { title: "Sự kiện trực tiếp", color: "#8B5CF6", img: "https://png.pngtree.com/thumb_back/fh260/background/20210918/pngtree-note-music-logo-watercolor-background-image_903000.png" },
    { title: "Dành Cho Bạn", color: "#A78BFA", img: "https://haoquanggroup.com/wp-content/uploads/cao-do-trong-am-nhac-la-gi-mot-so-ky-hieu-lien-quan-den-cao-do-31546.jpg" },
    { title: "Bản phát hành sắp ra mắt", color: "#047857", img: "https://cdn-media.sforum.vn/storage/app/media/H%C3%ACnh%20n%E1%BB%81n%20%C3%A2m%20nh%E1%BA%A1c/hinh-nen-am-nhac-22.jpg" },
    { title: "Mới phát hành", color: "#4D7C0F", img: "https://cdn-media.sforum.vn/storage/app/media/H%C3%ACnh%20n%E1%BB%81n%20%C3%A2m%20nh%E1%BA%A1c/hinh-nen-am-nhac-1.jpg" },
    { title: "Nhạc Việt", color: "#64748B", img: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/hinh_nen_am_nhac_cover_735bc482b1.png" },
    { title: "Pop", color: "#64748B", img: "https://png.pngtree.com/background/20211217/original/pngtree-note-smudge-pattern-pink-watercolor-background-picture-image_1589085.jpg" },
    { title: "K-Pop", color: "#DC2626", img: "https://png.pngtree.com/thumb_back/fh260/background/20250415/pngtree-a-futuristic-dj-robot-performs-in-vibrant-nightclub-surrounded-by-an-image_17189288.jpg" },
    { title: "Hip-Hop", color: "#F97316", img: "https://png.pngtree.com/thumb_back/fh260/background/20241224/pngtree-futuristic-robot-hand-skillfully-operating-a-dj-console-with-precision-and-image_16829981.jpg" }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      <View style={{ padding: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={() => {
            setSearchQuery("");
            setSearchResults(null);
            Keyboard.dismiss();
          }}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : searchQuery === "" ? (
        <ScrollView style={{ padding: 16 }}>
          <Text style={{ color: "white", fontSize: 17, fontWeight: "700", marginBottom: 16 }}>
            Duyệt tìm tất cả
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={{
                  width: '48%',
                  height: 120,
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: item.color,
                  padding: 12,
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 5,
                  elevation: 4
                }}
                onPress={() => onPressCategory(item.title)}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>{item.title}</Text>

                {item.img && (
                  <Image
                    source={{ uri: item.img }}
                    style={{
                      width: 70,
                      height: 70,
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      borderRadius: 8,
                      transform: [{ rotate: '-15deg' }],
                    }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={unified}
          keyExtractor={(i) => `${i.type}_${i.data.id}`}
          renderItem={renderSearchResult}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ color: "#9ca3af", paddingVertical: 12 }}>Không có kết quả</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
