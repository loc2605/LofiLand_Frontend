import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar: React.FC = () => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Bạn muốn nghe gì?"
        placeholderTextColor="#8A8A8A"
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
});