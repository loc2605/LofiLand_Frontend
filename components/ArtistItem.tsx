import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axiosInstance from '../utils/axiosInstance';

type ArtistItemProps = {
  id: string;
  name: string;
  image: string;
  onPress?: () => void;
};

const ArtistItem: React.FC<ArtistItemProps> = ({ id, name, image, onPress }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);


 useEffect(() => {
  const fetchFollowing = async () => {
    try {
      const res = await axiosInstance.get('/api/follows/user/me');
      const followed = res.data.data.some((f: any) => f.artist.id === id);
      setIsFollowing(followed);
    } catch (err) {
      console.log('Follow check error:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchFollowing();
}, [id]); // chỉ phụ thuộc vào id của artist


  // Handle follow/unfollow
  const handleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowing) {
        await axiosInstance.post('/api/follows/unfollow', { artistId: id });
        setIsFollowing(false);
      } else {
        await axiosInstance.post('/api/follows/follow', {
          artist: { id, name, avatarUrl: image },
        });
        setIsFollowing(true);
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
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>

      <TouchableOpacity
        style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
        onPress={handleFollow}
        disabled={loading}
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
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 52.5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#A9A9A9',
  },
  name: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 5,
  },
followButton: {
  minWidth: 80,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  alignItems: 'center',
  justifyContent: 'center',
},
following: {
  backgroundColor: '#666',
},
notFollowing: {
  backgroundColor: '#9747FF',
},
followButtonText: {
  color: '#FFF',
  fontSize: 12,
  fontWeight: 'bold',
  textAlign: 'center',
  paddingHorizontal: 5,
},

});