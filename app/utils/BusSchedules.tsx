import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { getBusSchedules } from './getBusSchedules';
import { getBusStops } from './getBusStops';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming MaterialIcons is used

interface BusSchedulesProps {
  selectedBus: string;
  onBusLineChange: (busLine: string) => void;
  onBusStopSelect: (busStop: BusStop) => void; // Yeni prop eklendi
}

interface Schedule {
  TARIFE_ID: string;
  DONUS_SAATI: string;
  GIDIS_SAATI: string;
  SIRA: string;
}

interface BusStop {
  DURAK_ID: string;
  DURAK_ADI: string;
}

const BusSchedules: React.FC<BusSchedulesProps> = React.memo(({ selectedBus, onBusLineChange, onBusStopSelect }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busStops, setBusStops] = useState<BusStop[]>([]);

  const busLines = ['883', '982', '981', '760', '882'];
  const busDescriptions: Record<string, string> = {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [scheduleData, stopsData] = await Promise.all([
        getBusSchedules(selectedBus),
        getBusStops(selectedBus)
      ]);
      setSchedules(scheduleData);
      setBusStops(stopsData);
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error);
      setError('Veri alınamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [selectedBus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const groupedSchedules = useMemo(() => {
    return schedules.reduce((acc, schedule) => {
      const { TARIFE_ID, DONUS_SAATI, GIDIS_SAATI, SIRA } = schedule;
      if (!acc[TARIFE_ID]) acc[TARIFE_ID] = [];
      acc[TARIFE_ID].push({ DONUS_SAATI, GIDIS_SAATI, SIRA });
      return acc;
    }, {} as Record<string, Schedule[]>);
  }, [schedules]);

  const tarifeData = useMemo(() => {
    return {
      '1': groupedSchedules['1'] || [], // Haftaiçi
      '2': groupedSchedules['2'] || [], // Cumartesi
      '3': groupedSchedules['3'] || [], // Pazar
    };
  }, [groupedSchedules]);

  const renderSchedule = useCallback(({ item }: { item: Schedule }) => (
    <View style={styles.scheduleRow}>
      <Text style={styles.scheduleText}>{item.GIDIS_SAATI}</Text>
      <Text style={styles.scheduleText}>{item.DONUS_SAATI}</Text>
    </View>
  ), []);

  const renderTarifeSection = useCallback((tarifeId: string, title: string) => (
    <View key={tarifeId} style={styles.tarifeColumn}>
      <Text style={styles.tarifeTitle}>{title}</Text>
      <FlatList
        data={tarifeData[tarifeId]}
        renderItem={renderSchedule}
        keyExtractor={(item) => item.SIRA.toString()}
        ListEmptyComponent={<Text style={styles.noDataText}>Veri yok</Text>}
      />
    </View>
  ), [tarifeData, renderSchedule]);

  const renderBusStop = useCallback(({ item }: { item: BusStop }) => (
    <TouchableOpacity 
      style={styles.busStopItem} 
      onPress={() => onBusStopSelect(item)} // Tıklama işlevi eklendi
    >
      <Icon name="place" size={24} color="#b71c1c" />
      <Text style={styles.busStopText}>{item.DURAK_ADI}</Text>
    </TouchableOpacity>
  ), [onBusStopSelect]);

  const renderContent = useCallback(() => (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.schedulesTitle}>Otobüs Hattı: {selectedBus}</Text>
        <Text style={styles.busDescription}>{busDescriptions[selectedBus]}</Text>
        <Text style={styles.dayName}>Bugün: {getDayName()}</Text>
        <Text style={styles.dateString}>Tarih: {getDateString()}</Text>
        <View style={styles.radioGroup}>
          {busLines.map(bus => (
            <TouchableOpacity
              key={bus}
              style={[styles.radioButton, selectedBus === bus && styles.selectedButton]}
              onPress={() => onBusLineChange(bus)}
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
      <View style={styles.busStopsContainer}>
        <Text style={styles.busStopsTitle}>Duraklar</Text>
        <FlatList
          data={busStops}
          renderItem={renderBusStop}
          keyExtractor={(item) => item.DURAK_ID.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.busStopsList}
        />
      </View>
    </>
  ), [selectedBus, busDescriptions, getDayName, getDateString, busLines, onBusLineChange, renderTarifeSection, busStops, renderBusStop]);

  if (loading) {
    return <ActivityIndicator size="large" color="#b71c1c" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={() => renderContent()}
      keyExtractor={(item) => item.key}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#b71c1c',
    borderBottomWidth: 1,
    borderBottomColor: '#7f0000',
    alignItems: 'center',
  },
  schedulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  busDescription: {
    fontSize: 16,
    marginBottom: 8,
    color: '#ffffff',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#ffffff',
  },
  dateString: {
    fontSize: 13,
    marginBottom: 8,
    color: '#ffffff',
  },
  noDataText: {
    fontSize: 16,
    color: '#ffffff',
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
    borderBottomColor: '#7f0000',
    backgroundColor: '#ffffff',
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
  radioGroup: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: '#b71c1c',
  },
  radioButtonText: {
    color: '#212529',
    fontSize: 16,
  },
  selectedButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  schedulesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: 10,
  },
  tarifeColumn: {
    flex: 1,
    marginHorizontal: 5,
    minWidth: 100,
    maxWidth: 200,
    padding: 9,
  },
  tarifeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#212529',
    textAlign: 'center',
  },
  busStopsContainer: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  busStopsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#b71c1c',
    padding: 16,
    textAlign: 'center',
  },
  busStopsList: {
    paddingVertical: 8,
  },
  busStopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  busStopText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginLeft: 52,
  },
});

export default BusSchedules;