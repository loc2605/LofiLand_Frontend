import React, { useState } from 'react';
import { StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../utils/axiosInstance';
import { useFollow } from '../context/FollowContext';

type ArtistItemProps = {
  id: string;
  name: string;
  image: string;
  onPress?: () => void;
};

const ArtistItem: React.FC<ArtistItemProps> = ({ id, name, image, onPress }) => {
  const { followedArtists, follow, unfollow } = useFollow();
  const [loading, setLoading] = useState(false);

  const isFollowing = id ? followedArtists.has(id) : false;

  const handleFollow = async () => {
    if (!id) return; // đảm bảo id tồn tại
    setLoading(true);
    try {
      if (isFollowing) {
        await axiosInstance.post('/api/follows/unfollow', { artistId: id });
        unfollow(id);
      } else {
        await axiosInstance.post('/api/follows/follow', {
          artist: { id, name, avatarUrl: image || '' },
        });
        follow(id);
      }
    } catch (err) {
      console.log('Follow/Unfollow error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name} numberOfLines={1}>{name}</Text>

      <TouchableOpacity
        style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
        onPress={handleFollow}
        disabled={loading || !id} // disable khi đang loading hoặc chưa có id
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
          </Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default ArtistItem;

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginRight: 20,
    alignItems: 'center',
    paddingBottom: 10,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A9A9A9',
  },
  name: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  followButton: {
    minWidth: 80,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  following: { backgroundColor: '#666' },
  notFollowing: { backgroundColor: '#9747FF' },
  followButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
});