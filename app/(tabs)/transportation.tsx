import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, Image, ImageSourcePropType, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, Region } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import TransportationDrawer from '../transportation/transportationdrawer';
import BusDetailPanel from '../transportation/BusDetailPanel';
import ComplaintsScreen from '../transportation/ComplaintsScreen';
import NotificationModal from '../transportation/NotificationModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getBusStops } from '../utils/getBusStops';
import BusSchedules from '../utils/BusSchedules';

const icons: Record<number, ImageSourcePropType> = {
  882: require('../imagestransportation/icon882.png'),
  883: require('../imagestransportation/icon883.png'),
  981: require('../imagestransportation/icon981.png'),
  982: require('../imagestransportation/icon982.png'),
  760: require('../imagestransportation/icon760.png'),
};

const defaultIcon: ImageSourcePropType = require('../imagestransportation/default-icon.png');

const getBusIcon = (busLine: number) => {
  return icons[busLine] || defaultIcon;
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
  const RETRY_DELAY = 6000; // 5 saniye bekleme süresi
  const BETWEEN_ATTEMPTS_DELAY = 5000; // Yeniden deneme arasındaki bekleme süresi (2 saniye)

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

interface BusStop {
  DURAK_ID: string;
  DURAK_ADI: string;
  ENLEM: string;
  BOYLAM: string;
}

// MapView tipini genişletelim
interface ExtendedMapView extends MapView {
  __lastRegion?: Region;
}

const Transportation: React.FC = () => {
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);

  const [isBusDetailPanelVisible, setBusDetailPanelVisible] = useState(false);
  const [isComplaintsScreenVisible, setComplaintsScreenVisible] = useState(false);
  const [isNotificationModalVisible, setNotificationModalVisible] = useState(false);

  const busLines = [982, 882, 883, 981, 760];
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<ExtendedMapView>(null);  // MapView referansı
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [selectedBusLine, setSelectedBusLine] = useState<string>('883'); // Varsayılan hat

  const [currentBusLineIndex, setCurrentBusLineIndex] = useState(0);

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
    } catch (error) {
      logWithTimestamp(`Error updating bus locations for line ${busLine}: ${error}`);
    }
  };

  const handleSelectBus = (busLine: number) => {
    const bus = busLocations.find((location) => location.busLine === busLine);
    if (bus) {
      setSelectedBus(bus);
      setSelectedBusLine(busLine.toString());
    }
  };

  const handleBusLineChange = (busLine: string) => {
    setSelectedBusLine(busLine);
    const bus = busLocations.find((location) => location.busLine === parseInt(busLine));
    if (bus) {
      setSelectedBus(bus);
    }
  };

  const [selectedBusStop, setSelectedBusStop] = useState<BusStop | null>(null);

  const handleBusStopSelect = useCallback((busStop: BusStop) => {
    setSelectedBusStop(busStop);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(busStop.ENLEM),
        longitude: parseFloat(busStop.BOYLAM),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setCurrentBusLineIndex((prevIndex) => (prevIndex + 1) % busLines.length);
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    const currentBusLine = busLines[currentBusLineIndex];
    updateBusLocations(currentBusLine);
  }, [currentBusLineIndex]);

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

  useEffect(() => {
    const loadBusStops = async () => {
      try {
        const stops = await getBusStops(selectedBusLine);
        setBusStops(stops);
      } catch (error) {
        console.error('Error loading bus stops:', error);
        // Hata durumunda boş bir dizi set et
        setBusStops([]);
      }
    };

    loadBusStops();
  }, [selectedBusLine]);

  const filteredBusStops = useMemo(() => {
    if (!mapRef.current || !mapRef.current.__lastRegion) return busStops;
    const currentRegion = mapRef.current.__lastRegion;

    const latDelta = currentRegion.latitudeDelta;
    const lonDelta = currentRegion.longitudeDelta;
    const zoomLevel = Math.log2(360 / latDelta) - 8;

    // Zoom seviyesine göre filtreleme
    if (zoomLevel < 12) {
      return busStops.filter((_, index) => index % 10 === 0); // Her 10. durak
    } else if (zoomLevel < 14) {
      return busStops.filter((_, index) => index % 5 === 0); // Her 5. durak
    } else {
      return busStops; // Tüm duraklar
    }
  }, [busStops, mapRef.current]);

  const renderBusStops = useCallback(() => {
    return filteredBusStops.map((stop, index) => (
      <Marker.Animated
        key={`stop-${stop.DURAK_ID}`}
        coordinate={{
          latitude: parseFloat(stop.ENLEM),
          longitude: parseFloat(stop.BOYLAM),
        }}
        title={stop.DURAK_ADI}
        description={`Durak ID: ${stop.DURAK_ID}`}
      >
        <Icon name="place" size={30} color="#b71c1c" />
      </Marker.Animated>
    ));
  }, [filteredBusStops]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <MapView
          ref={mapRef as React.RefObject<MapView>}  // MapView referansı
          style={styles.map}
          initialRegion={{
            latitude: 38.323278,
            longitude: 26.636833,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onRegionChangeComplete={(region) => {
            if (mapRef.current) {
              (mapRef.current as ExtendedMapView).__lastRegion = region;
            }
          }}
        >
          {busLocations.map((bus, index) => {
            if (!bus.KoorX || !bus.KoorY) return null;

            const busLineNumber = bus.busLine;
            return (
              <Marker
                key={`bus-${index}`}
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
          {renderBusStops()}
          {selectedBusStop && (
            <Marker
              coordinate={{
                latitude: parseFloat(selectedBusStop.ENLEM),
                longitude: parseFloat(selectedBusStop.BOYLAM),
              }}
              title={selectedBusStop.DURAK_ADI}
              description={`Durak ID: ${selectedBusStop.DURAK_ID}`}
            >
              <Icon name="place" size={30} color="#b71c1c" />
            </Marker>
          )}
        </MapView>

        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={['4%', '50%', '90%']}
          enablePanDownToClose={false}
          enableContentPanningGesture={false}
          enableHandlePanningGesture={true}
          handleStyle={styles.bottomSheetHandle}
        >
          <View style={styles.bottomSheetContent}>
            <FlatList
              data={[1]}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <TransportationDrawer
                  busLocations={busLocations}
                  onBusIconPress={handleSelectBus}
                  selectedBusLine={selectedBusLine}
                  onBusLineChange={handleBusLineChange}
                  onBusStopSelect={handleBusStopSelect}
                />
              )}
            />
          </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  bottomSheetHandle: {
    backgroundColor: '#f7f7f7',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default React.memo(Transportation);
