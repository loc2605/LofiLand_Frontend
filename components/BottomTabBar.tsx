// components/BottomTabBar.tsx
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Kiểu cho item
type TabBarItemProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  isFocused: boolean;
  onPress?: () => void; // Thêm onPress để điều hướng
};

// Component hiển thị 1 item tab (không đổi cấu trúc tên biến theo yêu cầu)
const TabBarItem: React.FC<TabBarItemProps> = ({ iconName, label, isFocused, onPress }) => {
  const color = isFocused ? "#B587FF" : "#A9A9A9";
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Map route cho 4 tab chính (đúng tên màn hình bạn đang dùng)
const ROUTES = {
  home: "/(app)/home",
  search: "/(app)/search",
  trending: "/(app)/trending",
  library: "/(app)/library",
} as const;

// Thanh tab dưới – giữ nguyên style, chỉ thêm điều hướng + tính isFocused
const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // isActive: tab sáng khi pathname khớp (hoặc khớp route con)
  const isActive = (route: string) => pathname === route || pathname.startsWith(route + "/");

  return (
    <View style={styles.container}>
      <TabBarItem
        iconName="home-outline"
        label="Trang chủ"
        isFocused={isActive(ROUTES.home)}
        onPress={() => router.push(ROUTES.home)}
      />
      <TabBarItem
        iconName="search-outline"
        label="Tìm kiếm"
        isFocused={isActive(ROUTES.search)}
        onPress={() => router.push(ROUTES.search)}
      />
      <TabBarItem
        iconName="pulse-outline"
        label="Thịnh hành"
        isFocused={isActive(ROUTES.trending)}
        onPress={() => router.push(ROUTES.trending)}
      />
      <TabBarItem
        iconName="library-outline"
        label="Bộ sưu tập"
        isFocused={isActive(ROUTES.library)}
        onPress={() => router.push(ROUTES.library)}
      />
    </View>
  );
};

export default BottomTabBar;

// Style giữ nguyên theo file gốc
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 80,
    backgroundColor: "#1A1A1A",
    borderTopWidth: 1,
    borderTopColor: "#303030",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10, // đảm bảo nổi trên nội dung
  },
  item: {
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 15,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: "bold",
  },
});
