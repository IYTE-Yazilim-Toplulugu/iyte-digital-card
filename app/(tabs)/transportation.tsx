import React, { useRef, useState, useEffect } from 'react';
import { View, Image, ImageSourcePropType, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import TransportationDrawer from '../transportation/transportationdrawer';
import BusDetailPanel from '../transportation/BusDetailPanel';
import ComplaintsScreen from '../transportation/ComplaintsScreen';
import NotificationModal from '../transportation/NotificationModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const icons: Record<number, ImageSourcePropType> = {
  882: require('../imagestransportation/icon882.png'),
  883: require('../imagestransportation/icon883.png'),
  981: require('../imagestransportation/icon981.png'),
  982: require('../imagestransportation/icon982.png'),
  760: require('../imagestransportation/icon760.png'),
  default: require('../imagestransportation/default-icon.png'),
};

const getBusIcon = (busLine: number) => {
  return icons[busLine] || icons.default;
};

export interface BusLocation {
  KoorX: string;
  KoorY: string;
  OtobusId: number;
  Yon: number;
  busLine: number;
}

const getTimeStamp = () => {
  const now = new Date();
  return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
};

const logWithTimestamp = (message: string) => {
  console.log(`[${getTimeStamp()}] ${message}`);
};

const fetchBusLocations = async (busLine: number, retryCount = 0): Promise<BusLocation[]> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 saniye bekleme süresi
  const BETWEEN_ATTEMPTS_DELAY = 2000; // Yeniden deneme arasındaki bekleme süresi (2 saniye)

  try {
    logWithTimestamp(`Fetching bus locations for line ${busLine}`);
    const response = await fetch(`https://openapi.izmir.bel.tr/api/iztek/hatotobuskonumlari/${busLine}`);

    if (response.status === 429) {
      throw new Error(`Rate limit exceeded for bus line ${busLine}`);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch for bus line ${busLine}. Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.HatOtobusKonumlari) {
      throw new Error(`No data returned for bus line ${busLine}`);
    }

    const locations = data.HatOtobusKonumlari.map((location: BusLocation) => ({
      ...location,
      busLine,
    }));

    logWithTimestamp(`Fetched ${locations.length} locations for bus line ${busLine}`);
    return locations || [];
  } catch (error) {
    logWithTimestamp(`Error fetching bus locations for ${busLine}: ${error}`);

    if (retryCount < MAX_RETRIES) {
      logWithTimestamp(`Retrying fetch for bus line ${busLine} (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, BETWEEN_ATTEMPTS_DELAY));  // Yeniden denemeden önce bekleme süresi
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));  // Bekleme süresi
      return fetchBusLocations(busLine, retryCount + 1);  // Yeniden deneme
    }

    // Hata durumunda boş liste döndürüyoruz.
    return [];
  }
};

const Transportation: React.FC = () => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [lastKnownBusLocations, setLastKnownBusLocations] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);

  const [isBusDetailPanelVisible, setBusDetailPanelVisible] = useState(false);
  const [isComplaintsScreenVisible, setComplaintsScreenVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);

  const busLines = [982, 882, 883, 981, 760];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);  // MapView referansı

  const fetchData = async () => {
    try {
      const initialBusLocations: BusLocation[] = [];

      for (const line of busLines) {
        const locations = await fetchBusLocations(line);
        initialBusLocations.push(...locations);
        
        // Her fetch işleminden sonra 2 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setBusLocations(initialBusLocations);
      setLastKnownBusLocations(initialBusLocations);
    } catch (error) {
      logWithTimestamp('Error loading data: ' + error);
    }
  };

  const updateBusLocations = async (busLine: number) => {
    try {
      const locations = await fetchBusLocations(busLine);
      setBusLocations((prevLocations) => {
        const filteredLocations = prevLocations.filter((loc) => loc.busLine !== busLine);
        return [...filteredLocations, ...locations];
      });
      setLastKnownBusLocations((prevLocations) => {
        const filteredLocations = prevLocations.filter((loc) => loc.busLine !== busLine);
        return [...filteredLocations, ...locations];
      });
    } catch (error) {
      logWithTimestamp(`Error updating bus locations for line ${busLine}: ${error}`);
      setBusLocations((prevLocations) => {
        const existingLocations = prevLocations.filter((loc) => loc.busLine === busLine);
        return [...existingLocations, ...lastKnownBusLocations.filter((loc) => loc.busLine === busLine)];
      });
    }
  };

  const fetchBusesSequentially = async () => {
    for (const busLine of busLines) {
      await updateBusLocations(busLine);
      await new Promise(resolve => setTimeout(resolve, 2000));  // 2 saniye bekle
    }

    // Tekrar başa dönmek için fonksiyonu çağırabiliriz
    setTimeout(fetchBusesSequentially, 10000); // 10 saniye bekle ve tekrar başla
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBusesSequentially();
  }, []);

  useEffect(() => {
    if (selectedBus && mapRef.current) {
      const { KoorX, KoorY } = selectedBus;
      const lat = parseFloat(KoorX.replace(',', '.'));
      const lon = parseFloat(KoorY.replace(',', '.'));

      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.005,  // Zoom seviyesi
        longitudeDelta: 0.005,
      }, 1000);  // Animasyon süresi
    }
  }, [selectedBus]);

  const handleSelectBus = (busLine: number) => {
    const bus = busLocations.find((location) => location.busLine === busLine);
    if (bus) {
      setSelectedBus(bus);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}  // MapView referansı
          style={styles.map}
          initialRegion={{
            latitude: 38.323278,
            longitude: 26.636833,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {busLocations.map((bus, index) => {
            if (!bus.KoorX || !bus.KoorY) return null;

            const busLineNumber = bus.busLine;
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: parseFloat(bus.KoorX.replace(',', '.')),
                  longitude: parseFloat(bus.KoorY.replace(',', '.')),
                }}
                onPress={() => setSelectedBus(bus)}
              >
                <Image source={getBusIcon(busLineNumber)} style={styles.icon} />
              </Marker>
            );
          })}
        </MapView>

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={['4%', '50%', '90%']}
          enablePanDownToClose={false}
        >
          <TransportationDrawer
            onClose={() => setSelectedBus(null)}
            busLocations={busLocations}
            onBusIconPress={handleSelectBus} // Yeni prop'u geçiyoruz
          />
        </BottomSheet>

        {selectedBus && (
          <Modal
            visible={isBusDetailPanelVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <BusDetailPanel
                bus={selectedBus}
                onClose={() => setBusDetailPanelVisible(false)}
              />
            </View>
          </Modal>
        )}

        {isComplaintsScreenVisible && (
          <Modal
            visible={isComplaintsScreenVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <ComplaintsScreen
                onClose={() => setComplaintsScreenVisible(false)}
              />
            </View>
          </Modal>
        )}

        {isNotificationModalVisible && (
          <Modal
            visible={isNotificationModalVisible}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <NotificationModal
                onClose={() => setNotificationModalVisible(false)}
              />
            </View>
          </Modal>
        )}

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setNotificationModalVisible(true)}
        >
          <Icon name="notifications" size={30} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.complaintsButton}
          onPress={() => setComplaintsScreenVisible(true)}
        >
          <Icon name="report-problem" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  icon: {
    width: 40,
    height: 40,
  },
  notificationButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  complaintsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Transportation;
