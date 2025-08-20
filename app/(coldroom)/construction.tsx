import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLD_ROOM_DEFAULTS } from '@/constants/coldRoomData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { PickerCard } from '@/components/PickerCard';

export default function ColdRoomConstructionScreen() {
  const [construction, setConstruction] = useState({
    insulationType: COLD_ROOM_DEFAULTS.insulationType,
    insulationThickness: COLD_ROOM_DEFAULTS.insulationThickness,
    // NEW MISSING INPUTS
    internalFloorThickness: COLD_ROOM_DEFAULTS.internalFloorThickness.toString(),
    numberOfHeaters: COLD_ROOM_DEFAULTS.numberOfHeaters.toString(),
    numberOfDoors: COLD_ROOM_DEFAULTS.numberOfDoors.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleInsulationTypeChange = (value: string | number) => {
    const newConstruction = { ...construction, insulationType: value as string };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('coldRoomConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const handleInsulationThicknessChange = (value: string | number) => {
    const newConstruction = { ...construction, insulationThickness: value as number };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('coldRoomConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const handleInputChange = (key: keyof typeof construction, value: string) => {
    const newConstruction = { ...construction, [key]: value };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('coldRoomConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('coldRoomConstructionData');
      if (saved) {
        setConstruction(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cold room construction data:', error);
    }
  };

  const insulationTypes = [
    { label: 'Polyurethane Foam (PUF)', value: 'PUF' },
    { label: 'Expanded Polystyrene (EPS)', value: 'EPS' },
    { label: 'Rockwool', value: 'Rockwool' },
  ];

  const thicknessOptions = [
    { label: '75mm', value: 75 },
    { label: '100mm (Recommended)', value: 100 },
    { label: '125mm', value: 125 },
    { label: '150mm', value: 150 },
    { label: '200mm', value: 200 },
  ];

  // Get U-factor for display
  const getUFactor = () => {
    const uFactors: any = {
      PUF: { 75: 0.32, 100: 0.25, 125: 0.20, 150: 0.17, 200: 0.13 },
      EPS: { 75: 0.45, 100: 0.35, 125: 0.28, 150: 0.23, 200: 0.18 },
      Rockwool: { 75: 0.50, 100: 0.38, 125: 0.30, 150: 0.25, 200: 0.20 }
    };
    return uFactors[construction.insulationType]?.[construction.insulationThickness] || 0.25;
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Construction Details" step={3} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insulation Specifications</Text>
          
          <PickerCard
            label="Insulation Type"
            value={construction.insulationType}
            options={insulationTypes}
            onValueChange={handleInsulationTypeChange}
          />
          
          <PickerCard
            label="Insulation Thickness"
            value={construction.insulationThickness}
            options={thicknessOptions}
            onValueChange={handleInsulationThicknessChange}
          />
          
          <InputCard 
            label="Internal Floor Thickness" 
            unit="mm" 
            value={construction.internalFloorThickness} 
            onChangeText={(value) => handleInputChange('internalFloorThickness', value)} 
          />
          
          <InputCard 
            label="Number of Heaters" 
            unit="units" 
            value={construction.numberOfHeaters} 
            onChangeText={(value) => handleInputChange('numberOfHeaters', value)} 
          />
          
          <InputCard 
            label="Number of Doors" 
            unit="units" 
            value={construction.numberOfDoors} 
            onChangeText={(value) => handleInputChange('numberOfDoors', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thermal Properties</Text>
          
          <View style={styles.propertiesCard}>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Selected Insulation:</Text>
              <Text style={styles.propertyValue}>{construction.insulationType}</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Thickness:</Text>
              <Text style={styles.propertyValue}>{construction.insulationThickness} mm</Text>
            </View>
            <View style={[styles.propertyRow, styles.highlightRow]}>
              <Text style={[styles.propertyLabel, styles.highlightLabel]}>U-Factor:</Text>
              <Text style={[styles.propertyValue, styles.highlightValue]}>{getUFactor().toFixed(3)} W/m²K</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Cold Room Insulation Guidelines</Text>
          <Text style={styles.infoText}>• Excel U-factor: 0.295 W/m²K (all surfaces)</Text>
          <Text style={styles.infoText}>• PUF (Polyurethane): Best thermal performance, most common</Text>
          <Text style={styles.infoText}>• EPS (Polystyrene): Cost-effective, good performance</Text>
          <Text style={styles.infoText}>• Rockwool: Fire resistant, good for special applications</Text>
          <Text style={styles.infoText}>• Thickness: 100-150mm typical for cold rooms</Text>
          <Text style={styles.infoText}>• Floor thickness: 100mm (Excel standard)</Text>
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
  propertiesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  highlightRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 12,
  },
  propertyLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  propertyValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  highlightLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  highlightValue: {
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