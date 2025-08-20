import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';

export default function BlastFreezerConditionsScreen() {
  const [conditions, setConditions] = useState({
    ambientTemp: BLAST_FREEZER_DEFAULTS.ambientTemp.toString(),
    roomTemp: BLAST_FREEZER_DEFAULTS.roomTemp.toString(),
    batchHours: BLAST_FREEZER_DEFAULTS.batchHours.toString(),
    operatingHours: BLAST_FREEZER_DEFAULTS.operatingHours.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof conditions, value: string) => {
    const newConditions = { ...conditions, [key]: value };
    setConditions(newConditions);
    // Save immediately
    AsyncStorage.setItem('blastFreezerConditionsData', JSON.stringify(newConditions)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerConditionsData');
      if (saved) {
        setConditions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer conditions data:', error);
    }
  };

  const ambientTemp = parseFloat(conditions.ambientTemp) || 0;
  const roomTemp = parseFloat(conditions.roomTemp) || 0;
  const tempDifference = ambientTemp - roomTemp;

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Operating Conditions" step={2} totalSteps={6} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Settings</Text>
          
          <InputCard
            label="Ambient Temperature"
            unit="°C"
            value={conditions.ambientTemp}
            onChangeText={(value) => handleInputChange('ambientTemp', value)}
          />
          
          <InputCard
            label="Room Temperature"
            unit="°C"
            value={conditions.roomTemp}
            onChangeText={(value) => handleInputChange('roomTemp', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Parameters</Text>
          
          <InputCard
            label="Batch Hours"
            unit="hrs"
            value={conditions.batchHours}
            onChangeText={(value) => handleInputChange('batchHours', value)}
          />
          
          <InputCard
            label="Operating Hours per Day"
            unit="hrs"
            value={conditions.operatingHours}
            onChangeText={(value) => handleInputChange('operatingHours', value)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Conditions Summary</Text>
            <Text style={styles.infoText}>• Ambient temperature: {ambientTemp.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Room temperature: {roomTemp.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Temperature difference: {tempDifference.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Batch processing time: {conditions.batchHours} hours</Text>
            <Text style={styles.infoText}>• Daily operating hours: {conditions.operatingHours} hours</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});
