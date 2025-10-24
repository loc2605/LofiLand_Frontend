import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào Mừng đến LofiLand</Text>
      <Text style={styles.subtitle}>Bạn đã sẵn sàng thư giãn với âm nhạc chưa?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1A2E', 
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#B587FF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#C7C7E5',
        textAlign: 'center',
    }
});