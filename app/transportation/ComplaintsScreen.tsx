import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface ComplaintsScreenProps {
  onClose: () => void;
}

const ComplaintsScreen: React.FC<ComplaintsScreenProps> = ({ onClose }) => {
  const [complaint, setComplaint] = useState('');

  const handleSubmit = () => {
    // Şikayet gönderme işlemini buraya ekleyebilirsiniz
    console.log('Complaint submitted:', complaint);
    onClose();  // Modalı kapat
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit a Complaint</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe your complaint"
        value={complaint}
        onChangeText={setComplaint}
        multiline
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Close" onPress={onClose} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});

export default ComplaintsScreen;
