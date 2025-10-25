import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

type SuggestionItemProps = {
  title: string;
  artist: string;
  image: string;
  onPress?: () => void;
};

const SuggestionItem: React.FC<SuggestionItemProps> = ({ title, artist, image, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.artist}>{artist}</Text>
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