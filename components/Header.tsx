import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = { 
  name: string; 
  profileImage: ImageSourcePropType;
  onProfilePress?: () => void;
  onChatPress?: () => void;
};

const Header: React.FC<HeaderProps> = ({ name, profileImage, onProfilePress, onChatPress }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Chào mừng</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onChatPress}>
          <Ionicons name="chatbubble-outline" size={24} color="#FFF" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfilePress}>
          <Image source={profileImage} style={styles.profileImage} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 14,
    color: '#D3D3D3',
    fontWeight: '300',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
