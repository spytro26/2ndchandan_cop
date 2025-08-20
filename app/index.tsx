import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Snowflake, Thermometer, Wind } from 'lucide-react-native';

export default function HomeScreen() {
  const handleFreezerPress = () => {
    router.push('/(freezer)');
  };

  const handleComingSoon = (type: string) => {
    Alert.alert(
      'Coming Soon', 
      `${type} calculations will be available in a future update.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleColdRoomPress = () => {
    router.push('/(coldroom)');
  };

  const handleBlastFreezerPress = () => {
    router.push('/(blastfreezer)');
  };

  return (
    <LinearGradient
      colors={['#EBF8FF', '#DBEAFE', '#BFDBFE']}
      style={styles.container}
    >
      <View style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Enzo CoolCalc</Text>
          <Text style={styles.subtitle}>Professional Refrigeration Load Calculator</Text>
        </View>

        <View style={styles.scrollContainer}>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionCard} onPress={handleFreezerPress}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.cardGradient}
              >
                <Snowflake color="#FFFFFF" size={28} strokeWidth={2} />
                <Text style={styles.cardTitle}>Freezer</Text>
                <Text style={styles.cardSubtitle}>Standard freezer rooms</Text>
                <Text style={styles.cardDescription}>Calculate cooling loads for standard freezer applications (-18°C to -25°C)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionCard} 
              onPress={handleBlastFreezerPress}
            >
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={styles.cardGradient}
              >
                <Wind color="#FFFFFF" size={28} strokeWidth={2} />
                <Text style={styles.cardTitle}>Blast Freezer</Text>
                <Text style={styles.cardSubtitle}>Quick freezing applications</Text>
                <Text style={styles.cardDescription}>Calculate cooling loads for rapid freezing applications (-25°C to -40°C)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionCard} 
              onPress={handleColdRoomPress}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.cardGradient}
              >
                <Thermometer color="#FFFFFF" size={28} strokeWidth={2} />
                <Text style={styles.cardTitle}>Cold Room</Text>
                <Text style={styles.cardSubtitle}>Above freezing storage</Text>
                <Text style={styles.cardDescription}>Calculate cooling loads for chilled storage (+2°C to +15°C)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionsContainer: {
    gap: 16,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  optionCard: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 11,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
});