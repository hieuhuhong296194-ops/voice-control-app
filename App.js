import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, StatusBar
} from 'react-native';
import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState('Chờ lệnh...');
  const [logs, setLogs] = useState([]);

  // ===== DANH SÁCH LỆNH TIẾNG VIỆT =====
  const commands = {
    // Lệnh hệ thống
    'mở wifi': () => respond('Đang mở WiFi...'),
    'tắt wifi': () => respond('Đang tắt WiFi...'),
    'mở bluetooth': () => respond('Đang mở Bluetooth...'),
    'tắt bluetooth': () => respond('Đang tắt Bluetooth...'),
    'tăng âm lượng': () => respond('Đang tăng âm lượng...'),
    'giảm âm lượng': () => respond('Đang giảm âm lượng...'),
    'tắt màn hình': () => respond('Đang tắt màn hình...'),

    // Lệnh ứng dụng
    'mở camera': () => respond('Đang mở Camera...'),
    'mở tin nhắn': () => respond('Đang mở Tin nhắn...'),
    'mở điện thoại': () => respond('Đang mở Điện thoại...'),
    'mở cài đặt': () => respond('Đang mở Cài đặt...'),

    // Lệnh trả lời
    'mấy giờ rồi': () => {
      const time = new Date().toLocaleTimeString('vi-VN');
      respond(`Bây giờ là ${time}`);
    },
    'hôm nay thứ mấy': () => {
      const day = new Date().toLocaleDateString('vi-VN', { weekday: 'long' });
      respond(`Hôm nay là ${day}`);
    },
    'xin chào': () => respond('Xin chào anh! Em đang lắng nghe.'),
    'cảm ơn': () => respond('Không có gì ạ!'),
  };

  // ===== XỬ LÝ GIỌNG NÓI =====
  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => {
      const text = e.value[0].toLowerCase();
      setTranscript(text);
      handleCommand(text);
    };
    Voice.onSpeechError = (e) => {
      setIsListening(false);
      addLog('Lỗi: ' + e.error?.message);
    };

    return () => Voice.destroy().then(Voice.removeAllListeners);
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('vi-VN'); // Tiếng Việt
      setTranscript('');
      setResult('Đang nghe...');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể khởi động mic: ' + e.message);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  // ===== XỬ LÝ LỆNH =====
  const handleCommand = (text) => {
    let found = false;
    for (const [key, action] of Object.entries(commands)) {
      if (text.includes(key)) {
        action();
        found = true;
        break;
      }
    }
    if (!found) {
      respond(`Không hiểu lệnh: "${text}"`);
    }
  };

  const respond = (message) => {
    setResult(message);
    addLog(message);
    Speech.speak(message, { language: 'vi-VN' });
  };

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('vi-VN');
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 20));
  };

  // ===== GIAO DIỆN =====
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>🎙️ Voice Control</Text>
      <Text style={styles.subtitle}>Điều khiển bằng tiếng Việt</Text>

      {/* Kết quả nhận dạng */}
      <View style={styles.transcriptBox}>
        <Text style={styles.label}>Đã nghe:</Text>
        <Text style={styles.transcript}>{transcript || '...'}</Text>
      </View>

      {/* Kết quả thực thi */}
      <View style={styles.resultBox}>
        <Text style={styles.resultText}>{result}</Text>
      </View>

      {/* Nút micro */}
      <TouchableOpacity
        style={[styles.micButton, isListening && styles.micActive]}
        onPressIn={startListening}
        onPressOut={stopListening}
      >
        <Text style={styles.micIcon}>{isListening ? '🔴' : '🎙️'}</Text>
        <Text style={styles.micText}>
          {isListening ? 'Đang nghe...' : 'Giữ để nói'}
        </Text>
      </TouchableOpacity>

      {/* Log */}
      <ScrollView style={styles.logBox}>
        <Text style={styles.label}>Nhật ký lệnh:</Text>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

// ===== STYLE =====
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0f0f1a',
    padding: 20, paddingTop: 50,
  },
  title: {
    fontSize: 28, fontWeight: 'bold',
    color: '#fff', textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, color: '#888',
    textAlign: 'center', marginBottom: 20,
  },
  transcriptBox: {
    backgroundColor: '#1a1a2e', borderRadius: 12,
    padding: 15, marginBottom: 10,
  },
  label: { color: '#666', fontSize: 12, marginBottom: 5 },
  transcript: { color: '#00d4ff', fontSize: 16 },
  resultBox: {
    backgroundColor: '#16213e', borderRadius: 12,
    padding: 15, marginBottom: 20, minHeight: 60,
    justifyContent: 'center',
  },
  resultText: {
    color: '#fff', fontSize: 16, textAlign: 'center',
  },
  micButton: {
    backgroundColor: '#4a00e0', borderRadius: 100,
    width: 140, height: 140, alignSelf: 'center',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, elevation: 8,
  },
  micActive: { backgroundColor: '#e00040', transform: [{ scale: 1.1 }] },
  micIcon: { fontSize: 40 },
  micText: { color: '#fff', fontSize: 13, marginTop: 5 },
  logBox: {
    flex: 1, backgroundColor: '#1a1a2e',
    borderRadius: 12, padding: 10,
  },
  logText: { color: '#aaa', fontSize: 12, marginBottom: 4 },
});
