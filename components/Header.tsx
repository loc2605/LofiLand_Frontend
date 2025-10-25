import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HeaderProps = { 
  name: string; 
  profileImage: ImageSourcePropType;
};

const Header: React.FC<HeaderProps> = ({ name, profileImage }) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>Chào mừng</Text>
        <Text style={styles.userName}>{name}</Text>
      </View>
      <View style={styles.rightSection}>
        <Ionicons name="notifications-outline" size={24} color="#FFF" style={styles.icon} />
        <Image source={profileImage} style={styles.profileImage} />
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
    paddingTop: 10,
    marginBottom: 20,
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
    marginRight: 15,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
  },
});