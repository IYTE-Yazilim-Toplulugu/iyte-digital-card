import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { BusLocation } from '../(tabs)/transportation'; // Otobüs konumları türünü içe aktar
import BusSchedules from '../utils/BusSchedules'; // Hareket saatleri bileşenini içe aktar

// İkonları bir nesne içinde sakla
const icons: { [key: number]: any } = {
  883: require('../imagestransportation/icon883.png'),
  882: require('../imagestransportation/icon882.png'),
  982: require('../imagestransportation/icon982.png'),
  981: require('../imagestransportation/icon981.png'),
  760: require('../imagestransportation/icon760.png'),
};

interface TransportationDrawerProps {
  onClose: () => void;
  busLocations?: BusLocation[]; // busLocations isteğe bağlı olabilir
  onBusIconPress: (busLine: number) => void; // Haritada zoom yapmak için yeni prop
}

const TransportationDrawer: React.FC<TransportationDrawerProps> = ({ onClose, busLocations = [], onBusIconPress }) => {

  // Yaklaşan otobüsleri filtrele
  const getApproachingBuses = () => {
    const now = new Date();
    return busLocations.filter(bus => {
      const departureTime = new Date(bus.departureTime); // Örnek olarak, bus.departureTime bir ISO formatında olmalı
      const timeDiff = departureTime.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60); // Farkı dakikaya çevir
      return minutesDiff <= 30 && minutesDiff >= 0; // Yaklaşan otobüsler (örneğin, 30 dakika içinde kalkacak)
    });
  };

  // Otobüs hatlarını benzersiz olarak filtrele
  const uniqueBusLocations = Array.from(new Set(busLocations.map(item => item.busLine)))
    .map(busLine => busLocations.find(item => item.busLine === busLine))
    .filter((item): item is BusLocation => item !== undefined);

  // Benzersiz otobüs ikonlarını render et
  const renderBusIcons = () => {
    return uniqueBusLocations.map((item: BusLocation) => {
      // HAT_NO'ya göre uygun ikonu seç
      const icon = icons[item.busLine] || icons[883]; // Varsayılan olarak icon883 kullan

      return (
        <TouchableOpacity 
          key={item.busLine} // key olarak busLine kullan, çünkü busLine benzersiz
          style={styles.iconButton} 
          onPress={() => onBusIconPress(item.busLine)} // Tıklama olayını ilet
        >
          <Image
            source={icon}
            style={styles.icon}
            onError={(e) => {
              console.log('Hata: İkon yüklenirken bir problem oluştu:', e.nativeEvent.error);
              Alert.alert('İkon Yükleme Hatası', 'İkon yüklenirken bir hata oluştu.');
            }}
          />
        </TouchableOpacity>
      );
    });
  };

  const approachingBuses = getApproachingBuses();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Aktif Otobüsler</Text>

      <View style={styles.iconsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true} 
          contentContainerStyle={styles.iconsScrollView}
        >
          {renderBusIcons()}
        </ScrollView>
      </View>

      {/* Hareket saatleri bileşenini her zaman göster */}
      <View style={styles.schedulesContainer}>
        <BusSchedules busLocations={busLocations} />
      </View>

      {approachingBuses.length > 0 && (
        <>
          <Text style={styles.title}>Yaklaşan Otobüsler</Text>
          <FlatList
            data={approachingBuses}
            renderItem={({ item }: { item: BusLocation }) => (
              <View style={styles.item}>
                <Text style={styles.itemText}>Otobüs ID: {item.OtobusId}</Text>
                <Text style={styles.itemText}>Hattı: {item.busLine}</Text>
                <Text style={styles.itemText}>Enlem: {item.KoorX}</Text>
                <Text style={styles.itemText}>Boylam: {item.KoorY}</Text>
              </View>
            )}
            keyExtractor={item => item.OtobusId.toString()}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#9a111f',
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#9a111f',
    textAlign: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconsScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 2, // Boşlukları azalt
    marginVertical: 4,
    padding: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#9a111f',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  schedulesContainer: {
    marginTop: 16,
  },
});

export default TransportationDrawer;
