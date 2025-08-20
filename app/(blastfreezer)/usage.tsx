import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';

export default function BlastFreezerUsageScreen() {
  const [usage, setUsage] = useState({
    peripheralHeatersQty: BLAST_FREEZER_DEFAULTS.peripheralHeatersQty.toString(),
    peripheralHeatersCapacity: BLAST_FREEZER_DEFAULTS.peripheralHeatersCapacity.toString(),
    doorHeatersQty: BLAST_FREEZER_DEFAULTS.doorHeatersQty.toString(),
    doorHeatersCapacity: BLAST_FREEZER_DEFAULTS.doorHeatersCapacity.toString(),
    trayHeatersQty: BLAST_FREEZER_DEFAULTS.trayHeatersQty.toString(),
    trayHeatersCapacity: BLAST_FREEZER_DEFAULTS.trayHeatersCapacity.toString(),
    drainHeatersQty: BLAST_FREEZER_DEFAULTS.drainHeatersQty.toString(),
    drainHeatersCapacity: BLAST_FREEZER_DEFAULTS.drainHeatersCapacity.toString(),
    airFlowPerFan: '5847',
  });

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (key: keyof typeof usage, value: string) => {
    const newUsage = { ...usage, [key]: value };
    setUsage(newUsage);
    AsyncStorage.setItem('blastFreezerUsageData', JSON.stringify(newUsage)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerUsageData');
      if (saved) {
        setUsage(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer usage data:', error);
    }
  };

  const totalPeripheralLoad = parseFloat(usage.peripheralHeatersQty) * parseFloat(usage.peripheralHeatersCapacity) || 0;
  const totalDoorLoad = parseFloat(usage.doorHeatersQty) * parseFloat(usage.doorHeatersCapacity) || 0;
  const totalTrayLoad = parseFloat(usage.trayHeatersQty) * parseFloat(usage.trayHeatersCapacity) || 0;
  const totalDrainLoad = parseFloat(usage.drainHeatersQty) * parseFloat(usage.drainHeatersCapacity) || 0;
  const totalHeaterLoad = totalPeripheralLoad + totalDoorLoad + totalTrayLoad + totalDrainLoad;

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Heater Usage" step={5} totalSteps={6} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peripheral Heaters</Text>
          
          <InputCard
            label="Quantity"
            unit="pcs"
            value={usage.peripheralHeatersQty}
            onChangeText={(value) => handleInputChange('peripheralHeatersQty', value)}
          />
          
          <InputCard
            label="Capacity per Unit"
            unit="kW"
            value={usage.peripheralHeatersCapacity}
            onChangeText={(value) => handleInputChange('peripheralHeatersCapacity', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Door Heaters</Text>
          
          <InputCard
            label="Quantity"
            unit="pcs"
            value={usage.doorHeatersQty}
            onChangeText={(value) => handleInputChange('doorHeatersQty', value)}
          />
          
          <InputCard
            label="Capacity per Unit"
            unit="kW"
            value={usage.doorHeatersCapacity}
            onChangeText={(value) => handleInputChange('doorHeatersCapacity', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tray Heaters</Text>
          
          <InputCard
            label="Quantity"
            unit="pcs"
            value={usage.trayHeatersQty}
            onChangeText={(value) => handleInputChange('trayHeatersQty', value)}
          />
          
          <InputCard
            label="Capacity per Unit"
            unit="kW"
            value={usage.trayHeatersCapacity}
            onChangeText={(value) => handleInputChange('trayHeatersCapacity', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Drain Heaters</Text>
          
          <InputCard
            label="Quantity"
            unit="pcs"
            value={usage.drainHeatersQty}
            onChangeText={(value) => handleInputChange('drainHeatersQty', value)}
          />
          
          <InputCard
            label="Capacity per Unit"
            unit="kW"
            value={usage.drainHeatersCapacity}
            onChangeText={(value) => handleInputChange('drainHeatersCapacity', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Flow Specifications</Text>
          
          <InputCard
            label="Air Flow per Fan"
            unit="CFM"
            value={usage.airFlowPerFan}
            onChangeText={(value) => handleInputChange('airFlowPerFan', value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculated Loads</Text>
          
          <View style={styles.calculatedCard}>
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Peripheral Heaters Load</Text>
              <Text style={styles.calculatedValue}>{totalPeripheralLoad.toFixed(2)} kW</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Door Heaters Load</Text>
              <Text style={styles.calculatedValue}>{totalDoorLoad.toFixed(2)} kW</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Tray Heaters Load</Text>
              <Text style={styles.calculatedValue}>{totalTrayLoad.toFixed(2)} kW</Text>
            </View>
            
            <View style={styles.calculatedRow}>
              <Text style={styles.calculatedLabel}>Drain Heaters Load</Text>
              <Text style={styles.calculatedValue}>{totalDrainLoad.toFixed(2)} kW</Text>
            </View>
            
            <View style={[styles.calculatedRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Heater Load</Text>
              <Text style={styles.totalValue}>{totalHeaterLoad.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Heater Usage Summary</Text>
            <Text style={styles.infoText}>• Peripheral: {usage.peripheralHeatersQty} × {usage.peripheralHeatersCapacity} kW = {totalPeripheralLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Door: {usage.doorHeatersQty} × {usage.doorHeatersCapacity} kW = {totalDoorLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Tray: {usage.trayHeatersQty} × {usage.trayHeatersCapacity} kW = {totalTrayLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Drain: {usage.drainHeatersQty} × {usage.drainHeatersCapacity} kW = {totalDrainLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Total heater load: {totalHeaterLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Air flow per fan: {usage.airFlowPerFan} CFM</Text>
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
