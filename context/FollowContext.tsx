import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

type FollowContextType = {
  followedArtists: Set<string>;
  follow: (artistId: string) => void;
  unfollow: (artistId: string) => void;
  isFollowing: (artistId: string) => boolean;
};

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export const FollowProvider = ({ children }: { children: ReactNode }) => {
  const [followedArtists, setFollowedArtists] = useState<Set<string>>(new Set());

  // Load initial follow list khi app start
  useEffect(() => {
    const fetchFollowed = async () => {
      try {
        const res = await axiosInstance.get('/api/follows/user/me');
        // Lọc artistId hợp lệ
        const ids: string[] = res.data.data
          .map((f: any) => f.artist?.id)
          .filter((id: any) => typeof id === 'string');

        setFollowedArtists(new Set(ids));
      } catch (err) {
        console.log('Error fetching followed artists:', err);
      }
    };
    fetchFollowed();
  }, []);

  // Follow artist
  const follow = (artistId: string) => {
    setFollowedArtists(prev => new Set(prev).add(artistId));
    // Gọi API backend để lưu
    axiosInstance.post('/api/follows/follow', { artistId }).catch(err => {
      console.log('Follow API error:', err);
    });
  };

  // Unfollow artist
  const unfollow = (artistId: string) => {
    setFollowedArtists(prev => {
      const newSet = new Set(prev);
      newSet.delete(artistId);
      return newSet;
    });
    // Gọi API backend để lưu
    axiosInstance.post('/api/follows/unfollow', { artistId }).catch(err => {
      console.log('Unfollow API error:', err);
    });
  };

  // Check nếu đang follow
  const isFollowing = (artistId: string) => {
    return followedArtists.has(artistId);
  };

  return (
    <FollowContext.Provider value={{ followedArtists, follow, unfollow, isFollowing }}>
      {children}
    </FollowContext.Provider>
  );
};

// Hook dùng trong component
export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) throw new Error('useFollow must be used within FollowProvider');
  return context;
};
