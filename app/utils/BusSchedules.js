import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { getBusSchedules } from '../utils/getBusSchedules'; // CSV'den verileri almak için yardımcı fonksiyon

const BusSchedules = ({ busLocations }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedBus, setSelectedBus] = useState('883');
  const [loading, setLoading] = useState(true); // Yükleme durumu
  const [error, setError] = useState(null); // Hata durumu

  const busDescriptions = {
    '882': 'İYTE - F.ALTAY AKT. MER. EKSPRES',
    '982': 'İYTE - URLA',
    '981': 'İYTE - F.ALTAY AKTARMA MERKEZİ',
    '760': 'ÇEŞME-URLA-BALIKLIOVA - F.ALTAY',
    '883': 'İYTE - F.ALTAY AKT. MER. EKSPRES',
  };

  const getDayName = () => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const today = new Date().getDay();
    return days[today];
  };

  const getDateString = () => {
    const today = new Date();
    return `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const data = await getBusSchedules(selectedBus);
        setSchedules(data);
      } catch (error) {
        setError('Hareket saatleri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [selectedBus]);

  if (loading) {
    return <ActivityIndicator size="large" color="#b71c1c" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const { TARIFE_ID, DONUS_SAATI, GIDIS_SAATI, SIRA } = schedule;
    if (!acc[TARIFE_ID]) acc[TARIFE_ID] = [];
    acc[TARIFE_ID].push({ DONUS_SAATI, GIDIS_SAATI, SIRA });
    return acc;
  }, {});

  const tarifeData = {
    '1': groupedSchedules['1'] || [], // Haftaiçi
    '2': groupedSchedules['2'] || [], // Cumartesi
    '3': groupedSchedules['3'] || [], // Pazar
  };

  const renderSchedule = (schedule) => (
    <View key={schedule.SIRA} style={styles.scheduleRow}>
      <Text style={styles.scheduleText}>{schedule.GIDIS_SAATI}</Text>
      <Text style={styles.scheduleText}>{schedule.DONUS_SAATI}</Text>
    </View>
  );

  const renderTarifeSection = (tarifeId, title) => (
    <View key={tarifeId} style={styles.tarifeColumn}>
      <Text style={styles.tarifeTitle}>{title}</Text>
      {tarifeData[tarifeId].length > 0 ? tarifeData[tarifeId].map(renderSchedule) : <Text style={styles.noDataText}>Veri yok</Text>}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.schedulesTitle}>Otobüs Hattı: {selectedBus}</Text>
        <Text style={styles.busDescription}>{busDescriptions[selectedBus]}</Text>
        <Text style={styles.dayName}>Bugün: {getDayName()}</Text>
        <Text style={styles.dateString}>Tarih: {getDateString()}</Text>
        <View style={styles.radioGroup}>
          {['883', '982', '981', '760', '882'].map(bus => (
            <TouchableOpacity
              key={bus}
              style={[styles.radioButton, selectedBus === bus && styles.selectedButton]}
              onPress={() => setSelectedBus(bus)}
            >
              <Text style={[styles.radioButtonText, selectedBus === bus && styles.selectedButtonText]}>{bus}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.schedulesContainer}>
        {renderTarifeSection('1', 'Haftaiçi')}
        {renderTarifeSection('2', 'Cumartesi')}
        {renderTarifeSection('3', 'Pazar')}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    backgroundColor: '#b71c1c', // Koyu kırmızı arka plan
    borderBottomWidth: 1,
    borderBottomColor: '#7f0000', // Daha koyu kırmızı sınır rengi
    alignItems: 'center',
  },
  schedulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff', // Beyaz renk metin
  },
  busDescription: {
    fontSize: 16,
    marginBottom: 8,
    color: '#ffffff', // Beyaz renk metin
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ffffff', // Beyaz renk metin
  },
  dateString: {
    fontSize: 13,
    marginBottom: 8,
    color: '#ffffff', // Beyaz renk metin
  },
  noDataText: {
    fontSize: 16,
    color: '#ffffff', // Beyaz renk metin
    marginTop: 20,
    textAlign: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#7f0000', // Daha koyu kırmızı sınır rengi
    backgroundColor: '#ffffff', // Beyaz arka plan
  },
  scheduleText: {
    fontSize: 13,
    color: '#212529',
    width: '60%',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#e9ecef', // Gri arka plan
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#b71c1c', // Koyu kırmızı arka plan
  },
  radioButtonText: {
    color: '#212529', // Koyu renk metin
    fontSize: 16,
  },
  selectedButtonText: {
    color: '#ffffff', // Beyaz renk metin
    fontWeight: 'bold',
  },
  schedulesContainer: {
    flexDirection: 'row', // Yatay düzen
    justifyContent: 'space-between', // Alanı eşit şekilde dağıt
    flexWrap: 'wrap', // Taşan öğeleri bir alt satıra kaydır
    marginHorizontal: 10,
  },
  tarifeColumn: {
    flex: 1,
    marginHorizontal: 5,
    minWidth:100, // Her bir sütun için minimum genişlik
    maxWidth: 200, // Her bir sütun için maksimum genişlik
    padding: 9,
  },
  tarifeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
    textAlign: 'center',
  },
});

export default BusSchedules;
