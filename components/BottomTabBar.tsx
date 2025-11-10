import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TabBarItemProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  isFocused: boolean;
  onPress?: () => void;
};

// Component 1 tab
const TabBarItem: React.FC<TabBarItemProps> = ({ iconName, label, isFocused, onPress }) => {
  const color = isFocused ? "#B587FF" : "#A9A9A9";
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const TABS = [
  { route: "/home", icon: "home-outline", label: "Trang chủ" },
  { route: "/search", icon: "search-outline", label: "Tìm kiếm" },
  { route: "/trending", icon: "pulse-outline", label: "Thịnh hành" },
  { route: "/library", icon: "library-outline", label: "Bộ sưu tập" },
] as const;

const BottomTabBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentIndex, setCurrentIndex] = useState(() => TABS.findIndex((t) => pathname.startsWith(t.route)) || 0);

  useEffect(() => {
    const index = TABS.findIndex((t) => pathname.startsWith(t.route));
    if (index !== -1) setCurrentIndex(index);
  }, [pathname]);

  // Chỉ hiển thị BottomTabBar trên các route chính
  const TAB_ROUTES = TABS.map((t) => t.route);
  if (!TAB_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  const handlePress = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    router.push(TABS[index].route);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => (
        <TabBarItem
          key={tab.route}
          iconName={tab.icon}
          label={tab.label}
          isFocused={index === currentIndex}
          onPress={() => handlePress(index)}
        />
      ))}
    </View>
  );
};

export default BottomTabBar;

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
    zIndex: 10,
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
