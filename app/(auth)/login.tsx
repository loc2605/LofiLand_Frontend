import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, TextInput as RNTextInput, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

const backgroundImage = require('../../assets/images/background.png'); 

const LoginScreen = () => {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');

  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = () => {
    if (!identifier || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập Email/Tên đăng nhập và Mật khẩu");
      return;
    }
    
    // Tích hợp API: Backend sẽ chịu trách nhiệm kiểm tra xem 'identifier' là email hay tên đăng nhập và xác thực tài khoản
    console.log('Đăng nhập với:', { identifier, password });
    // TODO: Tích hợp API Đăng nhập tại đây
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <Stack.Screen options={{ title: 'Đăng nhập LofiLand', headerShown: false }} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>LofiLand</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại</Text>
        
        {/* Trường Nhận Email hoặc Tên đăng nhập */}
        <TextInput
          style={styles.input}
          // THAY ĐỔI 2: Cập nhật placeholder
          placeholder="Email hoặc tên đăng nhập" 
          placeholderTextColor="#B587FF"
          autoCapitalize="none"
          autoCorrect={false}
          value={identifier}
          onChangeText={setIdentifier}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        
        {/* Trường Mật khẩu */}
        <TextInput
          ref={passwordRef}
          style={styles.input}
          placeholder="Mật khẩu"
          placeholderTextColor="#B587FF"
          secureTextEntry
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.footerText}>Bạn chưa có tài khoản? <Text style={styles.linkText}>Đăng ký</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', 
    justifyContent: 'center',
  },
  keyboardAvoidingContainer: { 
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(26, 26, 46, 0.7)', 
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#B587FF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#C7C7E5', 
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 55,
    backgroundColor: 'rgba(36, 36, 63, 0.8)', 
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    marginBottom: 20,
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
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#C7C7E5',
    fontSize: 14,
  },
  linkText: {
    color: '#B587FF', 
    fontWeight: 'bold',
  }
});

export default LoginScreen;