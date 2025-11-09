import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  Easing,
  PanResponder,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

interface EditProfileModalProps {
  visible: boolean;
  user: { username: string; avatarUrl?: string };
  onClose: () => void;
  onSave: (updatedUser: { username: string; avatarUrl?: string; imageFile?: any }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatarUrl || "");
  const [imageFile, setImageFile] = useState<any>(null);

  const panY = useRef(new Animated.Value(height)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: height,
    duration: 300,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) closeAnim.start(onClose);
        else resetPositionAnim.start();
      },
    })
  ).current;

  // Chỉ reset state khi modal mở, tránh reset khi gõ
  useEffect(() => {
    if (visible) {
      setUsername(user.username);
      setAvatar(user.avatarUrl || "");
      panY.setValue(height);
      resetPositionAnim.start();
    } else {
      closeAnim.start();
    }
  }, [visible]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Quyền bị từ chối", "Cần cấp quyền truy cập ảnh để thay đổi avatar!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const picked = result.assets[0];
      setAvatar(picked.uri);
      setImageFile({
        uri: picked.uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      });
    }
  };

  const handleSave = () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống!");
      return;
    }
    onSave({ username, avatarUrl: avatar, imageFile });
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.modal, { transform: [{ translateY: panY }] }]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Lưu</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.avatarContainer}>
            <Image
              source={avatar ? { uri: avatar } : require("../assets/images/avatar.png")}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon} onPress={handlePickImage}>
              <FontAwesome name="pencil" size={18} color="#191717ff" />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập tên..."
              placeholderTextColor="#aaa"
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9998,
  },
  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "85%",
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
    zIndex: 9999,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  cancel: { color: "#aaa", fontSize: 16 },
  save: { color: "#9747FF", fontSize: 16, fontWeight: "600" },
  body: { alignItems: "center", marginTop: 10 },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
  },
  field: {
    width: "100%",
    borderBottomColor: "#333",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    color: "#fff",
    fontSize: 16,
  },
});
