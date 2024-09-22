import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchNotifications, Notification } from '../utils/notificationUtils';

const csvUrl = 'https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hat-duyurulari.csv'; // URL buraya tanımlandı

interface NotificationModalProps {
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications(csvUrl);
        setNotifications(data);
      } catch (err) {
        setError(err.message || 'Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9E9E9E" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <ScrollView style={styles.scrollContainer}>
        {notifications.map((notification, index) => (
          <View key={index} style={styles.notificationCard}>
            <Text style={styles.lineNumber}>Line {notification.line}</Text>
            <Text style={styles.cardTitle}>{notification.title}</Text>
            <Text style={styles.dates}>
              {notification.startDate} - {notification.endDate}
            </Text>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={onClose}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F4F8', // Pastel gri-mavi arka plan
    padding: 20,
    borderRadius: 16,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A90E2', // Pastel mavi başlık rengi
    marginBottom: 15,
  },
  scrollContainer: {
    width: '100%',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF', // Beyaz arka plan
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderColor: '#E0E0E0', // Açık gri kenar
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  lineNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A90E2', // Pastel mavi yazı
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333', // Koyu gri yazı
    marginBottom: 6,
  },
  dates: {
    fontSize: 14,
    color: '#757575', // Orta gri yazı
  },
  errorText: {
    color: '#FF6F61', // Pastel kırmızı hata rengi
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4A90E2', // Pastel mavi buton arka plan
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF', // Beyaz yazı
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationModal;
