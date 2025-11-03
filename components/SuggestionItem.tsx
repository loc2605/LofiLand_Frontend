import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

type SuggestionItemProps = {
  title: string;
  artist: string;
  image: string;
  onPress?: () => void;
};

const SuggestionItem: React.FC<SuggestionItemProps> = ({ title, artist, image, onPress }) => {
  const artistName = artist;
  const imageSource =
    image && image.startsWith('http')
      ? { uri: image }
      : { uri: 'https://cdn-icons-png.flaticon.com/512/727/727245.png' };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={imageSource} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.artist} numberOfLines={1}>{artistName}</Text>
    </TouchableOpacity>
  );
};

export default SuggestionItem;

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 400,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    position: 'absolute',
    bottom: 35,
    left: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  artist: {
    fontSize: 16,
    color: '#f5f0f0ff',
    position: 'absolute',
    bottom: 15,
    left: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
