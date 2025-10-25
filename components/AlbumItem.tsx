import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

type AlbumItemProps = {
  title: string;
  artist: string;
  image: string;
};

const AlbumItem: React.FC<AlbumItemProps> = ({ title, artist, image }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.artist}>{artist}</Text>
    </TouchableOpacity>
  );
};

export default AlbumItem;

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginRight: 15,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 5,
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  artist: {
    fontSize: 12,
    color: '#A9A9A9',
  },
});
