import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native';

interface RightDrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  user: {
    username: string;
    avatarUrl?: string;
  } | null;
  onEdit: () => void;
  onLogout: () => void;
}

const RightDrawerMenu: React.FC<RightDrawerMenuProps> = ({
  visible,
  onClose,
  user,
  onEdit,
  onLogout,
}) => {
  const { width } = Dimensions.get('window');
  const slideAnim = React.useRef(new Animated.Value(width)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, width]);

  const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Overlay nền mờ */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: user?.avatarUrl || defaultProfileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user?.username || 'Người dùng'}</Text>

          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            onClose();
            setTimeout(onLogout, 150);
          }}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default RightDrawerMenu;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: Dimensions.get('window').width * 0.7,
    backgroundColor: '#111',
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 10,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  username: { color: '#fff', fontSize: 20, fontWeight: '600' },
  editButton: {
    backgroundColor: '#9747FF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editText: { color: '#fff', fontWeight: '600' },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: '#FF4D4D',
    textAlign: 'center',
    fontWeight: '600',
  },
});
