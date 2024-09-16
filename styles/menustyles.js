import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  
  menuCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 25,  // Daha yuvarlak köşeler
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },  // Daha derin gölge
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderColor: '#c4a8a1',
    borderWidth: 1,
    backgroundImage: 'url(https://path-to-subtle-pattern.png)',  // Hafif doku
  },
  title: {
    fontSize: 28,  // Biraz daha büyük font
    fontWeight: '900',  // Çok kalın font
    marginBottom: 25,
    color: '#222',
    textAlign: 'center',
    letterSpacing: 1.5,  // Harf aralığı artırıldı
  },
  dayCard: {
    marginBottom: 30,  // Daha geniş boşluk
  },
  dayTitle: {
    fontSize: 24,  // Daha büyük başlık
    fontWeight: '800',
    color: '#222',
    marginBottom: 18,
    letterSpacing: 1.2,  // Harfler arasında daha geniş boşluk
  },
  table: {
    marginTop: 18,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 18,  // Daha geniş boşluk
    borderBottomWidth: 1.2,
    borderBottomColor: '#e0e0e0',  // Daha açık gri
    paddingHorizontal: 25,  // Daha fazla yatay boşluk
  },
  tableCellName: {
    fontSize: 20,  // Daha büyük font
    fontWeight: '700',
    color: '#444',
  },
  tableCellCalories: {
    fontSize: 18,
    color: '#b81d36',
    fontStyle: 'italic',
    textShadowColor: '#f5f5f5',  // Hafif bir metin gölgesi
    textShadowOffset: { width: 1, height: 1 }, 
  },
  errorText: {
    color: '#d9534f',
    fontSize: 20,  // Daha büyük font
    textAlign: 'center',
    marginTop: 25,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  noMealsText: {
    fontSize: 18,
    color: '#b81d36',
    textAlign: 'center',
    marginTop: 30,  // Daha geniş boşluk
    fontStyle: 'italic',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 20,
    color: '#333',
    marginHorizontal: 25,
  },
  icon: {
    fontSize: 38,
    color: 'linear-gradient(45deg, #b81d36, #e63946)',  // Gradient ikon rengi
  },
  commentSection: {
    marginTop: 30,
    padding: 30,  // Daha geniş padding
    backgroundColor: '#ffffff',
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderColor: '#c4a8a1',
    borderWidth: 1,
  },
  commentsList: {
    marginBottom: 25,
  },
  commentCard: {
    padding: 18,
    borderBottomWidth: 1.2,
    borderBottomColor: '#e0e0e0',
    marginBottom: 18,
  },
  commentText: {
    fontSize: 20,
    color: '#333',
  },
  noCommentsText: {
    fontSize: 18,
    color: '#b81d36',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  input: {
    borderColor: '#d0d0d0',
    borderWidth: 1,
    borderRadius: 15,
    padding: 18,  // Daha geniş padding
    marginTop: 25,
    marginBottom: 18,
    fontSize: 18,
    color: '#333',
    backgroundColor: '#f8f9fa',  // Hafif bir arka plan
  },
  ratingSection: {
    marginTop: 30,
    padding: 25,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderColor: '#c4a8a1',
    borderWidth: 1,
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likeButton: {
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  dislikeButton: {
    padding: 12,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  likeButtonText: {
    fontSize: 18,
    color: '#155724',
  },
  dislikeButtonText: {
    fontSize: 18,
    color: '#721c24',
  },
});

export default styles;
