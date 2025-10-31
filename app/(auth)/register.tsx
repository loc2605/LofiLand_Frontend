import { Stack, useRouter, useFocusEffect } from 'expo-router';
import React, { useRef, useState, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../utils/axiosInstance';
import { Image } from 'expo-image';

const backgroundImage = require('../../assets/images/background.webp');

const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef<RNTextInput>(null);
  const passwordRef = useRef<RNTextInput>(null);
  const confirmPasswordRef = useRef<RNTextInput>(null);

  // 🔹 Reset form khi focus vào màn hình
  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      Keyboard.dismiss();
    }, [])
  );

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email.trim())) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!strongPassword.test(password)) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 1 chữ và 1 số');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);

    try {
      const res = await axiosInstance.post('/api/users/register', {
        email,
        username,
        password,
        avatarUrl: '',
      });

      await AsyncStorage.setItem('auth', JSON.stringify(res.data));

      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập');
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.log('Register API error:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || error.message || 'Không thể kết nối server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Ảnh nền local dùng expo-image */}
      <Image
        source={backgroundImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={400}
        blurRadius={2}
        cachePolicy="memory" // ⚡ Giữ ảnh trong RAM, load cực nhanh
      />

      <Stack.Screen options={{ title: 'Đăng ký LofiLand', headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình âm nhạc của bạn</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Địa chỉ Email"
          placeholderTextColor="#B587FF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current?.focus()}
        />

        <TextInput
          ref={usernameRef}
          style={styles.input}
          placeholder="Tên đăng nhập"
          placeholderTextColor="#B587FF"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#B587FF"
          secureTextEntry
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />

        <TextInput
          ref={confirmPasswordRef}
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#B587FF"
          secureTextEntry
          autoCorrect={false}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          returnKeyType="go"
          onSubmitEditing={handleRegister}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerButton} onPress={() => router.back()}>
          <Text style={styles.footerText}>
            Đã có tài khoản? <Text style={styles.linkText}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#B587FF',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#C7C7E5',
    textAlign: 'center',
  },
  input: {
    height: 55,
    backgroundColor: 'rgba(36, 36, 63, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A4A6F',
  },
  button: {
    backgroundColor: '#9747FF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#9747FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerButton: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    color: '#C7C7E5',
    fontSize: 14,
  },
  linkText: {
    color: '#B587FF',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
