import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';

export default function BlastFreezerRoomScreen() {
  const [dimensions, setDimensions] = useState({
    length: BLAST_FREEZER_DEFAULTS.length.toString(),
    breadth: BLAST_FREEZER_DEFAULTS.breadth.toString(),
    height: BLAST_FREEZER_DEFAULTS.height.toString(),
    doorWidth: BLAST_FREEZER_DEFAULTS.doorWidth.toString(),
    doorHeight: BLAST_FREEZER_DEFAULTS.doorHeight.toString(),
    doorClearOpening: '2100',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof dimensions, value: string) => {
    const newDimensions = { ...dimensions, [key]: value };
    setDimensions(newDimensions);
    // Save immediately
    AsyncStorage.setItem('blastFreezerRoomData', JSON.stringify(newDimensions)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerRoomData');
      if (saved) {
        setDimensions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer room data:', error);
    }
  };

  const length = parseFloat(dimensions.length) || 0;
  const breadth = parseFloat(dimensions.breadth) || 0;
  const height = parseFloat(dimensions.height) || 0;
  const doorWidth = parseFloat(dimensions.doorWidth) || 0;
  const doorHeight = parseFloat(dimensions.doorHeight) || 0;

  const wallArea = 2 * (length * height) + 2 * (breadth * height);
  const ceilingArea = length * breadth;
  const floorArea = length * breadth;
  const volume = length * breadth * height;
  const doorArea = doorWidth * doorHeight;

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Blast Freezer Room" step={1} totalSteps={6} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Dimensions</Text>
          
          <InputCard
            label="Length"
            unit="m"
            value={dimensions.length}
            onChangeText={(value) => handleInputChange('length', value)}
          />
          
          <InputCard
            label="Breadth"
            unit="m"
            value={dimensions.breadth}
            onChangeText={(value) => handleInputChange('breadth', value)}
          />
          
          <InputCard
            label="Height"
            unit="m"
            value={dimensions.height}
            onChangeText={(value) => handleInputChange('height', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Door Specifications</Text>
          
          <InputCard
            label="Door Width"
            unit="m"
            value={dimensions.doorWidth}
            onChangeText={(value) => handleInputChange('doorWidth', value)}
          />
          
          <InputCard
            label="Door Height"
            unit="m"
            value={dimensions.doorHeight}
            onChangeText={(value) => handleInputChange('doorHeight', value)}
          />
          
          <InputCard
            label="Door Clear Opening"
            unit="mm"
            value={dimensions.doorClearOpening}
            onChangeText={(value) => handleInputChange('doorClearOpening', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculated Areas</Text>
          
          <View style={styles.calculatedCard}>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Wall Area</Text>
              <Text style={styles.calculatedValue}>{wallArea.toFixed(1)} m²</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Ceiling Area</Text>
              <Text style={styles.calculatedValue}>{ceilingArea.toFixed(1)} m²</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Floor Area</Text>
              <Text style={styles.calculatedValue}>{floorArea.toFixed(1)} m²</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Door Area</Text>
              <Text style={styles.calculatedValue}>{doorArea.toFixed(1)} m²</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Door Clear Opening</Text>
              <Text style={styles.calculatedValue}>{parseFloat(dimensions.doorClearOpening) || 2100} mm</Text>
            </View>
            
            <View style={[styles.calculatedRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Volume</Text>
              <Text style={styles.totalValue}>{volume.toFixed(1)} m³</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Room Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {length.toFixed(1)}m × {breadth.toFixed(1)}m × {height.toFixed(1)}m</Text>
            <Text style={styles.infoText}>• Door size: {doorWidth.toFixed(1)}m × {doorHeight.toFixed(1)}m</Text>
            <Text style={styles.infoText}>• Total wall area: {wallArea.toFixed(1)} m²</Text>
            <Text style={styles.infoText}>• Room volume: {volume.toFixed(1)} m³</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    paddingTop: 8,
    marginTop: 8,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  calculatedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
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
