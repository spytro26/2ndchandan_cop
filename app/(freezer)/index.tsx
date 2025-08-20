import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREEZER_DEFAULTS } from '@/constants/freezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { PickerCard } from '@/components/PickerCard';

export default function RoomScreen() {
  const [dimensions, setDimensions] = useState({
    length: FREEZER_DEFAULTS.length.toString(),
    width: FREEZER_DEFAULTS.width.toString(),
    height: FREEZER_DEFAULTS.height.toString(),
    doorWidth: FREEZER_DEFAULTS.doorWidth.toString(),
    doorHeight: FREEZER_DEFAULTS.doorHeight.toString(),
    doorOpenings: FREEZER_DEFAULTS.dailyDoorOpenings.toString(),
    insulationType: FREEZER_DEFAULTS.insulationType,
    insulationThickness: FREEZER_DEFAULTS.insulationThickness,
    internalFloorThickness: FREEZER_DEFAULTS.internalFloorThickness.toString(),
    numberOfFloors: FREEZER_DEFAULTS.numberOfFloors.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof dimensions, value: string) => {
    const newDimensions = { ...dimensions, [key]: value };
    setDimensions(newDimensions);
    // Save immediately
    AsyncStorage.setItem('roomData', JSON.stringify(newDimensions)).catch(console.error);
  };

  const handleInsulationTypeChange = (value: string | number) => {
    const newDimensions = { ...dimensions, insulationType: value as string };
    setDimensions(newDimensions);
    // Save immediately
    AsyncStorage.setItem('roomData', JSON.stringify(newDimensions)).catch(console.error);
  };

  const handleInsulationThicknessChange = (value: string | number) => {
    const newDimensions = { ...dimensions, insulationThickness: value as number };
    setDimensions(newDimensions);
    // Save immediately
    AsyncStorage.setItem('roomData', JSON.stringify(newDimensions)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('roomData');
      if (saved) {
        setDimensions(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  };

  const length = parseFloat(dimensions.length) || 0;
  const width = parseFloat(dimensions.width) || 0;
  const height = parseFloat(dimensions.height) || 0;
  const doorWidth = parseFloat(dimensions.doorWidth) || 0;
  const doorHeight = parseFloat(dimensions.doorHeight) || 0;

  const wallArea = 2 * (length + width) * height;
  const ceilingArea = length * width;
  const floorArea = length * width;
  const volume = length * width * height;
  const doorArea = doorWidth * doorHeight;

  const insulationTypes = [
    { label: 'Polyurethane Foam (PUF)', value: 'PUF' },
    { label: 'Expanded Polystyrene (EPS)', value: 'EPS' },
    { label: 'Rockwool', value: 'Rockwool' },
  ];

  const thicknessOptions = [
    { label: '75mm', value: 75 },
    { label: '100mm', value: 100 },
    { label: '125mm', value: 125 },
    { label: '150mm (Recommended)', value: 150 },
    { label: '200mm', value: 200 },
  ];

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Room Specifications" step={1} totalSteps={4} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room Dimensions</Text>
          
          <InputCard label="Length" unit="m" value={dimensions.length} onChangeText={(value) => handleInputChange('length', value)} />
          <InputCard label="Width" unit="m" value={dimensions.width} onChangeText={(value) => handleInputChange('width', value)} />
          <InputCard label="Height" unit="m" value={dimensions.height} onChangeText={(value) => handleInputChange('height', value)} />
          
          <InputCard label="Door Width" unit="m" value={dimensions.doorWidth} onChangeText={(value) => handleInputChange('doorWidth', value)} />
          <InputCard label="Door Height" unit="m" value={dimensions.doorHeight} onChangeText={(value) => handleInputChange('doorHeight', value)} />
          
          <InputCard 
            label="Daily Door Openings" 
            unit="times" 
            value={dimensions.doorOpenings} 
            onChangeText={(value) => handleInputChange('doorOpenings', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Construction Specifications</Text>
          
          <PickerCard
            label="Insulation Type"
            value={dimensions.insulationType}
            options={insulationTypes}
            onValueChange={handleInsulationTypeChange}
          />
          
          <PickerCard
            label="Insulation Thickness"
            value={dimensions.insulationThickness}
            options={thicknessOptions}
            onValueChange={handleInsulationThicknessChange}
          />
          
          <InputCard 
            label="Internal Floor Thickness" 
            unit="mm" 
            value={dimensions.internalFloorThickness} 
            onChangeText={(value) => handleInputChange('internalFloorThickness', value)} 
          />
          
          <InputCard 
            label="Number of Floors" 
            unit="floors" 
            value={dimensions.numberOfFloors} 
            onChangeText={(value) => handleInputChange('numberOfFloors', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculated Areas</Text>
          
          <View style={styles.calculatedCard}>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Wall Area:</Text>
              <Text style={styles.calculatedValue}>{wallArea.toFixed(1)} m²</Text>
            </View>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Ceiling Area:</Text>
              <Text style={styles.calculatedValue}>{ceilingArea.toFixed(1)} m²</Text>
            </View>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Floor Area:</Text>
              <Text style={styles.calculatedValue}>{floorArea.toFixed(1)} m²</Text>
            </View>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Door Area:</Text>
              <Text style={styles.calculatedValue}>{doorArea.toFixed(1)} m²</Text>
            </View>
            <View style={[styles.calculatedRow, styles.totalRow]}>
              <Text style={[styles.calculatedLabel, styles.totalLabel]}>Room Volume:</Text>
              <Text style={[styles.calculatedValue, styles.totalValue]}>{volume.toFixed(1)} m³</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Freezer Room Guidelines</Text>
          <Text style={styles.infoText}>• Standard freezer: -18°C to -25°C</Text>
          <Text style={styles.infoText}>• Humidity: 80-90% RH for optimal conditions</Text>
          <Text style={styles.infoText}>• Air circulation: 1500-2500 CFM per fan</Text>
          <Text style={styles.infoText}>• Floor insulation: 150-200mm typical</Text>
          <Text style={styles.infoText}>• Door openings: 10-20 times/day typical</Text>
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
    marginTop: 8,
    paddingTop: 12,
  },
  calculatedLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  calculatedValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
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