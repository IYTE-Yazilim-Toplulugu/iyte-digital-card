import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  icon: {
    width: 47,
    height: 47,
    resizeMode: 'contain',
  },
  errorContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    zIndex: 1, // Üst üste binen öğeler arasında hata mesajlarının görünmesini sağlar
  },
  errorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    zIndex: 1, // Panelin üst üste binen diğer öğelerin üstünde olmasını sağlar
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
 
    // Mevcut stilleriniz burada olacak
    button: {
      backgroundColor: '#007BFF',
      padding: 10,
      borderRadius: 5,
      marginTop: 10, // Butonlar arasında boşluk eklemek için
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
 
  
});

export default styles;
