import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import BusSchedules from '../utils/BusSchedules';

interface TransportationDrawerProps {
  busLocations: any[];
  onBusIconPress: (busLine: number) => void;
  selectedBusLine: string;
  onBusLineChange: (busLine: string) => void;
  onBusStopSelect: (busStop: any) => void; // Yeni prop eklendi
}

const TransportationDrawer: React.FC<TransportationDrawerProps> = ({
  busLocations,
  onBusIconPress,
  selectedBusLine,
  onBusLineChange,
  onBusStopSelect, // Yeni prop eklendi
}) => {
  const getBusIcon = useMemo(() => {
    const icons: Record<number, any> = {
      882: require('../imagestransportation/icon882.png'),
      883: require('../imagestransportation/icon883.png'),
      981: require('../imagestransportation/icon981.png'),
      982: require('../imagestransportation/icon982.png'),
      760: require('../imagestransportation/icon760.png'),
    };
    const defaultIcon = require('../imagestransportation/default-icon.png');
    return (busLine: number) => icons[busLine] || defaultIcon;
  }, []);

  const uniqueBusLines = useMemo(() => 
    Array.from(new Set(busLocations.map(bus => bus.busLine))),
    [busLocations]
  );

  const renderBusIcon = useCallback(({ item }: { item: number }) => (
    <TouchableOpacity
      style={styles.busIconContainer}
      onPress={() => onBusIconPress(item)}
    >
      <Image 
        source={getBusIcon(item)} 
        style={[
          styles.busIcon,
          selectedBusLine === item.toString() && styles.selectedBusIcon
        ]} 
      />
    </TouchableOpacity>
  ), [getBusIcon, onBusIconPress, selectedBusLine]);

  const keyExtractor = useCallback((item: number) => item.toString(), []);

  const renderContent = useCallback(() => (
    <>
      <View style={styles.activeBusesContainer}>
        <FlatList
          data={uniqueBusLines}
          renderItem={renderBusIcon}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.busIconsScroll}
        />
      </View>
      <BusSchedules
        selectedBus={selectedBusLine}
        onBusLineChange={onBusLineChange}
        onBusStopSelect={onBusStopSelect} // Yeni prop eklendi
      />
    </>
  ), [uniqueBusLines, renderBusIcon, keyExtractor, selectedBusLine, onBusLineChange, onBusStopSelect]);

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={() => renderContent()}
      keyExtractor={(item) => item.key}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  activeBusesContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busIconsScroll: {
    flexGrow: 0,
  },
  busIconContainer: {
    alignItems: 'center',
    marginRight: 0,
  },
  busIcon: {
    width: 80,
    height: 80,
    opacity: 0.4, // Seçili olmayan ikonları biraz soluk göster
  },
  selectedBusIcon: {
    opacity: 1, // Seçili ikonu tam opaklıkta göster
    transform: [{ scale: 1.1 }], // Seçili ikonu biraz büyüt
  },
});

export default React.memo(TransportationDrawer);
