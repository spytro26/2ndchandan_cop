import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLD_ROOM_DEFAULTS } from '@/constants/coldRoomData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';

export default function ColdRoomConditionsScreen() {
  const [conditions, setConditions] = useState({
    externalTemp: COLD_ROOM_DEFAULTS.externalTemp.toString(),
    internalTemp: COLD_ROOM_DEFAULTS.internalTemp.toString(),
    operatingHours: COLD_ROOM_DEFAULTS.operatingHours.toString(),
    pullDownTime: COLD_ROOM_DEFAULTS.pullDownTime.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof conditions, value: string) => {
    const newConditions = { ...conditions, [key]: value };
    setConditions(newConditions);
    // Save immediately
    AsyncStorage.setItem('coldRoomConditionsData', JSON.stringify(newConditions)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('coldRoomConditionsData');
      if (saved) {
        setConditions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cold room conditions data:', error);
    }
  };

  const externalTemp = parseFloat(conditions.externalTemp) || 0;
  const internalTemp = parseFloat(conditions.internalTemp) || 0;
  const tempDifference = externalTemp - internalTemp;

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Operating Conditions" step={2} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Settings</Text>
          
          <InputCard 
            label="External Temperature" 
            unit="°C" 
            value={conditions.externalTemp} 
            onChangeText={(value) => handleInputChange('externalTemp', value)} 
          />
          <InputCard 
            label="Internal Temperature" 
            unit="°C" 
            value={conditions.internalTemp} 
            onChangeText={(value) => handleInputChange('internalTemp', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operation Parameters</Text>
          
          <InputCard 
            label="Operating Hours per Day" 
            unit="hrs" 
            value={conditions.operatingHours} 
            onChangeText={(value) => handleInputChange('operatingHours', value)} 
          />
          
          <InputCard 
            label="Pull-down Time" 
            unit="hrs" 
            value={conditions.pullDownTime} 
            onChangeText={(value) => handleInputChange('pullDownTime', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculated Values</Text>
          
          <View style={styles.calculatedCard}>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Temperature Difference (ΔT):</Text>
              <Text style={styles.calculatedValue}>{tempDifference.toFixed(1)} °C</Text>
            </View>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Operating Factor:</Text>
              <Text style={styles.calculatedValue}>{(parseFloat(conditions.operatingHours) / 24).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Typical Cold Room Conditions</Text>
          <Text style={styles.infoText}>• Excel example: +2°C storage temperature</Text>
          <Text style={styles.infoText}>• Excel ambient: +45°C external temperature</Text>
          <Text style={styles.infoText}>• Pharmaceutical storage: +2°C to +8°C</Text>
          <Text style={styles.infoText}>• Produce storage: +1°C to +4°C</Text>
          <Text style={styles.infoText}>• Operating hours: 20 hours/day (Excel example)</Text>
          <Text style={styles.infoText}>• Pull-down time: 24 hours (Excel standard)</Text>
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
  calculatedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  calculatedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  calculatedValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
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