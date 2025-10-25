import React from 'react';
import { StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SuggestionItemProps = {
  title: string;
  artist: string;
  image: string;
};

const SuggestionItem: React.FC<SuggestionItemProps> = ({ title, artist, image }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        start={{ x: 0.5, y: 0.3 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.overlay}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.artist}>{artist}</Text>
      </LinearGradient>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  artist: {
    fontSize: 14,
    color: '#D3D3D3',
  },
});