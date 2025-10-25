import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabBarItemProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  isFocused: boolean;
};

const TabBarItem: React.FC<TabBarItemProps> = ({ iconName, label, isFocused }) => {
  const color = isFocused ? '#B587FF' : '#A9A9A9';
  return (
    <TouchableOpacity style={styles.item}>
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const BottomTabBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <TabBarItem iconName="home-outline" label="Home" isFocused={true} />
      <TabBarItem iconName="search-outline" label="Search" isFocused={false} />
      <TabBarItem iconName="pulse-outline" label="Feed" isFocused={false} />
      <TabBarItem iconName="library-outline" label="Library" isFocused={false} />
    </View>
  );
};

export default BottomTabBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#303030',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  item: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 15,
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: 'bold',
  },
});