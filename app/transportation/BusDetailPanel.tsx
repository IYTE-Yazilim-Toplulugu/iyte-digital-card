import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Otobüs detayları türü
interface BusDetailPanelProps {
  bus: {
    busLine: number;
    OtobusId: number;
    KoorX: string;
    KoorY: string;
  } | null;
  onClose: () => void;
}

const BusDetailPanel: React.FC<BusDetailPanelProps> = ({ bus, onClose }) => {
  if (!bus) return null;

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Bus Details</Text>
      <Text>Bus Line: {bus.busLine}</Text>
      <Text>Bus ID: {bus.OtobusId}</Text>
      <Text>Latitude: {bus.KoorY.replace(',', '.')}</Text>
      <Text>Longitude: {bus.KoorX.replace(',', '.')}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 5,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default BusDetailPanel;
