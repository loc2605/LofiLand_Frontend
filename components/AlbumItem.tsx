import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

type AlbumItemProps = {
  title: string;
  artist: string;
  image: string;
  onPress: () => void;
};

const AlbumItem: React.FC<AlbumItemProps> = ({ title, artist, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text
        style={styles.title}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <Text style={styles.artist}>{artist}</Text>
    </TouchableOpacity>
  );
};

export default AlbumItem;

const styles = StyleSheet.create({
  container: {
    width: 130,
    marginRight: 15,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 5,
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  artist: {
    fontSize: 14,
    color: '#A9A9A9',
  },
});
