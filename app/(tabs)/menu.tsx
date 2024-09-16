import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Switch, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { htmlToText } from 'html-to-text';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/menustyles'; // Stil dosyasını import et

const getCurrentDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = (startDate: string): { date: string; dayName: string }[] => {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dates.push({ date: `${year}-${month}-${day}`, dayName: date.toLocaleDateString('tr-TR', { weekday: 'long' }) });
  }
  return dates;
};

const fetchMeals = async (date: string, isVegetarian: boolean) => {
  const mealType = isVegetarian ? 'V' : 'O';
  const apiUrl = `https://yks.iyte.edu.tr/yemekliste.aspx?tarih=${date}&ogun=${mealType}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }

    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error fetching meal data:', error);
    throw error;
  }
};

const parseHtmlTable = (html: string) => {
  const text = htmlToText(html, {
    ignoreImage: true,
    wordwrap: false,
  });

  const cleanedText = text
    .replace(/ADKALORI/g, '')
    .replace(/Nisan [^\n]*/g, '')
    .trim();

  const mealPattern = /([^\d]+)(\d+)/g;
  const mealData: { name: string; calories: string }[] = [];

  let match;
  while ((match = mealPattern.exec(cleanedText)) !== null) {
    const name = match[1].trim();
    const calories = match[2].trim();
    mealData.push({ name, calories });
  }

  return mealData;
};

const MenuPage: React.FC = () => {
  const [meals, setMeals] = useState<{ date: string; dayName: string; meals: { name: string; calories: string }[] }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [viewWeekly, setViewWeekly] = useState<boolean>(false);

  const [menuRating, setMenuRating] = useState<{ likes: number; dislikes: number }>({
    likes: 0,
    dislikes: 0,
  });

  const loadMeals = async (date: string, isVegetarian: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const html = await fetchMeals(date, isVegetarian);
      const mealData = parseHtmlTable(html);
      if (mealData.length === 0) {
        setError('Yemek bulunamadı.');
      } else {
        setMeals([{ date, dayName: new Date(date).toLocaleDateString('tr-TR', { weekday: 'long' }), meals: mealData }]);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Error fetching meal data.');
      } else {
        setError('Error fetching meal data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyMeals = async (startDate: string, isVegetarian: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const weekDates = getWeekDates(startDate);
      const weeklyMeals = await Promise.all(weekDates.map(day => fetchMeals(day.date, isVegetarian)));
      const weeklyData = weekDates.map((day, index) => ({
        date: day.date,
        dayName: day.dayName,
        meals: parseHtmlTable(weeklyMeals[index]),
      }));
      setMeals(weeklyData);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Error fetching meal data.');
      } else {
        setError('Error fetching meal data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewWeekly) {
      loadWeeklyMeals(getCurrentDate(), isVegetarian);
    } else {
      loadMeals(getCurrentDate(), isVegetarian);
    }
  }, [isVegetarian, viewWeekly]);

  const handleLike = () => {
    setMenuRating(prevRating => ({
      ...prevRating,
      likes: prevRating.likes + 1,
    }));
  };

  const handleDislike = () => {
    setMenuRating(prevRating => ({
      ...prevRating,
      dislikes: prevRating.dislikes + 1,
    }));
  };

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <View style={styles.menuCard}>
          <Text style={styles.title}>
            {viewWeekly ? 'Haftalık Yemek Menüsü' : (isVegetarian ? 'Vejetaryen Yemek Menüsü' : 'Günlük Yemek Menüsü')}
          </Text>

          <View style={styles.switchContainer}>
            <Icon 
              name={isVegetarian ? 'food-apple' : 'food-drumstick'} 
              style={styles.icon}
            />
            <Switch
              value={isVegetarian}
              onValueChange={(value) => setIsVegetarian(value)}
              trackColor={{ false: '#767577', true: '#9a1220' }}
              thumbColor={isVegetarian ? '#ffffff' : '#f4f3f4'}
            />
            <Icon 
              name={isVegetarian ? 'food-drumstick' : 'food-apple'} 
              style={styles.icon}
            />
          </View>

          <Button
            title={viewWeekly ? 'Günlük Menüyü Göster' : 'Haftalık Menüyü Göster'}
            onPress={() => setViewWeekly(!viewWeekly)}
            color="#9a1220"
          />

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.table}>
              {viewWeekly ? (
                meals.length > 0 ? (
                  meals.map((day, index) => (
                    <View key={index} style={styles.dayCard}>
                      <Text style={styles.dayTitle}>{day.dayName}</Text>
                      {day.meals.length > 0 ? (
                        day.meals.map((meal, idx) => (
                          <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCellName}>{meal.name}</Text>
                            <Text style={styles.tableCellCalories}>{meal.calories} kalori</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noMealsText}>Yemek bulunamadı.</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMealsText}>Yemek bulunamadı.</Text>
                )
              ) : (
                <View style={styles.table}>
                  {meals.length > 0 ? (
                    meals[0].meals.map((meal, index) => (
                      <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCellName}>{meal.name}</Text>
                        <Text style={styles.tableCellCalories}>{meal.calories} kalori</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noMealsText}>Yemek bulunamadı.</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {!viewWeekly && (
            <>
              {/* Menü Puanlama */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>Menüyü Puanla</Text>
                <View style={styles.ratingButtons}>
                  <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
                    <Text style={styles.likeButtonText}>Beğen ({menuRating.likes})</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDislike} style={styles.dislikeButton}>
                    <Text style={styles.dislikeButtonText}>Beğenme ({menuRating.dislikes})</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.commentSection}>
                <Text style={styles.title}>Yorumlar</Text>

                <ScrollView style={styles.commentsList}>
                  {/* Placeholder for comments */}
                  <Text style={styles.noCommentsText}>Henüz yorum yapılmamış.</Text>
                </ScrollView>

                <TextInput
                  style={styles.input}
                  placeholder="Yorumunuzu yazın..."
                />
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default MenuPage;
