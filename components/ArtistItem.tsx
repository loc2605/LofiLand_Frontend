import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

type ArtistItemProps = {
  name: string;
  image: string;
};

const ArtistItem: React.FC<ArtistItemProps> = ({ name, image }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Theo dõi</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ArtistItem;

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: 20,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    borderWidth: 1,
  },
  name: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  followButton: {
    backgroundColor: '#303030',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});