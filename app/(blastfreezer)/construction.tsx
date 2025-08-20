import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS, BLAST_FREEZER_CONSTANTS, calculateUFactor } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { PickerCard } from '@/components/PickerCard';
import { InputCard } from '@/components/InputCard';

export default function BlastFreezerConstructionScreen() {
  const [construction, setConstruction] = useState({
    insulationType: BLAST_FREEZER_DEFAULTS.insulationType,
    wallThickness: BLAST_FREEZER_DEFAULTS.wallThickness,
    ceilingThickness: BLAST_FREEZER_DEFAULTS.ceilingThickness,
    floorThickness: BLAST_FREEZER_DEFAULTS.floorThickness,
    internalFloorThickness: BLAST_FREEZER_DEFAULTS.internalFloorThickness.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleInsulationTypeChange = (value: string | number) => {
    const newConstruction = { ...construction, insulationType: value as string };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('blastFreezerConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const handleThicknessChange = (key: string, value: string | number) => {
    const newConstruction = { ...construction, [key]: value };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('blastFreezerConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const handleInputChange = (key: keyof typeof construction, value: string) => {
    const newConstruction = { ...construction, [key]: value };
    setConstruction(newConstruction);
    // Save immediately
    AsyncStorage.setItem('blastFreezerConstructionData', JSON.stringify(newConstruction)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerConstructionData');
      if (saved) {
        setConstruction(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer construction data:', error);
    }
  };

  const insulationTypes = [
    { label: 'Polyurethane Foam (PUF)', value: 'PUF' },
    { label: 'Expanded Polystyrene (EPS)', value: 'EPS' },
    { label: 'Rockwool', value: 'Rockwool' },
  ];

  const thicknessOptions = [
    { label: '100mm', value: 100 },
    { label: '125mm', value: 125 },
    { label: '150mm (Recommended)', value: 150 },
    { label: '200mm', value: 200 },
  ];

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
            label="Wall Insulation Thickness"
            value={construction.wallThickness}
            options={thicknessOptions}
            onValueChange={(value) => handleThicknessChange('wallThickness', value)}
          />
          
          <PickerCard
            label="Ceiling Insulation Thickness"
            value={construction.ceilingThickness}
            options={thicknessOptions}
            onValueChange={(value) => handleThicknessChange('ceilingThickness', value)}
          />
          
          <PickerCard
            label="Floor Insulation Thickness"
            value={construction.floorThickness}
            options={thicknessOptions}
            onValueChange={(value) => handleThicknessChange('floorThickness', value)}
          />
          
          <InputCard 
            label="Internal Floor Thickness" 
            unit="mm" 
            value={construction.internalFloorThickness} 
            onChangeText={(value) => handleInputChange('internalFloorThickness', value)} 
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
              <Text style={styles.propertyLabel}>Wall Thickness:</Text>
              <Text style={styles.propertyValue}>{construction.wallThickness} mm</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Ceiling Thickness:</Text>
              <Text style={styles.propertyValue}>{construction.ceilingThickness} mm</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Floor Thickness:</Text>
              <Text style={styles.propertyValue}>{construction.floorThickness} mm</Text>
            </View>
            <View style={[styles.propertyRow, styles.highlightRow]}>
              <Text style={[styles.propertyLabel, styles.highlightLabel]}>U-Factor (Calculated):</Text>
              <Text style={[styles.propertyValue, styles.highlightValue]}>
                {calculateUFactor(construction.insulationType, construction.wallThickness).toFixed(3)} W/m²K
              </Text>
            </View>
            <Text style={styles.infoText}>• Dynamic U-factor: Based on insulation type and thickness</Text>
            <Text style={styles.infoText}>• PUF thermal conductivity: 0.023 W/mK</Text>
            <Text style={styles.infoText}>• EPS thermal conductivity: 0.036 W/mK</Text>
            <Text style={styles.infoText}>• Rockwool thermal conductivity: 0.040 W/mK</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Blast Freezer Construction Guidelines</Text>
          <Text style={styles.infoText}>• PUF (Polyurethane): Best thermal performance for extreme temperatures</Text>
          <Text style={styles.infoText}>• EPS (Polystyrene): Cost-effective, good performance</Text>
          <Text style={styles.infoText}>• Rockwool: Fire resistant, excellent for industrial applications</Text>
          <Text style={styles.infoText}>• Thickness: 150-200mm recommended for blast freezers</Text>
          <Text style={styles.infoText}>• Floor insulation: Critical for preventing ground heat gain</Text>
          <Text style={styles.infoText}>• Fixed U-factor: 0.153 W/m²K (industry standard)</Text>
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
    color: '#1E3A8A',
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