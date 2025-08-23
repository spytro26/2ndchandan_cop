import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';
import { FileText, Download } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateColdRoomLoad } from '@/utils/coldRoomCalculations';

export default function ColdRoomResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateResults();
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      if (roomData && conditionsData && productData) {
        const room = JSON.parse(roomData);
        const conditions = JSON.parse(conditionsData);
        const construction = constructionData ? JSON.parse(constructionData) : {};
        const product = JSON.parse(productData);

        // Merge construction data with room data
        const mergedRoomData = { ...room, ...construction };

        const calculationResults = calculateColdRoomLoad(mergedRoomData, conditions, product);
        setResults(calculationResults);
      }
    } catch (error) {
      console.error('Error calculating results:', error);
      Alert.alert('Error', 'Failed to calculate cooling load. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results) return;

    const reportData = `
COLD ROOM COOLING LOAD CALCULATION REPORT
==========================================

ROOM SPECIFICATIONS:
- Dimensions: ${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.height}m
- Volume: ${results.volume.toFixed(2)} m³
- Wall Area: ${results.areas.wall.toFixed(2)} m²
- Ceiling Area: ${results.areas.ceiling.toFixed(2)} m²
- Floor Area: ${results.areas.floor.toFixed(2)} m²
- Door Area: ${results.areas.door.toFixed(2)} m²

OPERATING CONDITIONS:
- External Temperature: ${results.conditions.externalTemp}°C
- Internal Temperature: ${results.conditions.internalTemp}°C
- Temperature Difference: ${results.temperatureDifference.toFixed(1)}°C
- Operating Hours: ${results.conditions.operatingHours} hrs/day
- Door Openings: ${results.doorOpenings} times/day

CONSTRUCTION:
- Insulation Type: ${results.construction.type}
- Insulation Thickness: ${results.construction.thickness}mm
- U-Factor: ${results.construction.uFactor.toFixed(3)} W/m²K
- Floor Thickness: ${results.construction.floorThickness}mm

PRODUCT INFORMATION:
- Product Type: ${results.productInfo.type}
- Daily Load: ${results.productInfo.mass} kg
- Incoming Temperature: ${results.productInfo.incomingTemp}°C
- Outgoing Temperature: ${results.productInfo.outgoingTemp}°C
- Specific Heat: ${results.productInfo.specificHeat} kJ/kg·K
- Respiration Rate: ${results.productInfo.respirationRate} W/tonne

STORAGE CAPACITY:
- Maximum Storage: ${results.storageCapacity.maximum.toFixed(0)} kg
- Current Load: ${results.storageCapacity.currentLoad} kg
- Utilization: ${results.storageCapacity.utilization.toFixed(1)}%
- Available Capacity: ${results.storageCapacity.availableCapacity.toFixed(0)} kg

COOLING LOAD BREAKDOWN:
1. Transmission Load:
   - Walls: ${results.breakdown.transmission.walls.toFixed(3)} kW
   - Ceiling: ${results.breakdown.transmission.ceiling.toFixed(3)} kW
   - Floor: ${results.breakdown.transmission.floor.toFixed(3)} kW
   - Total: ${results.breakdown.transmission.total.toFixed(3)} kW

2. Product Load: ${results.breakdown.product.toFixed(3)} kW

3. Respiration Load: ${results.breakdown.respiration.toFixed(3)} kW

4. Air Change Load: ${results.breakdown.airChange.toFixed(3)} kW

5. Door Opening Load: ${results.breakdown.doorOpening.toFixed(3)} kW

6. Miscellaneous Loads:
   - Equipment: ${results.breakdown.miscellaneous.equipment.toFixed(3)} kW
   - Occupancy: ${results.breakdown.miscellaneous.occupancy.toFixed(3)} kW
   - Lighting: ${results.breakdown.miscellaneous.lighting.toFixed(3)} kW
   - Total: ${results.breakdown.miscellaneous.total.toFixed(3)} kW

7. Heater Loads:
   - Peripheral: ${results.breakdown.heaters.peripheral.toFixed(3)} kW
   - Door: ${results.breakdown.heaters.door.toFixed(3)} kW
   - Steam: ${results.breakdown.heaters.steam.toFixed(3)} kW
   - Total: ${results.breakdown.heaters.total.toFixed(3)} kW

FINAL RESULTS:
- Total Load (Before Safety): ${results.totalBeforeSafety.toFixed(3)} kW
- Safety Factor Load: ${results.safetyFactorLoad.toFixed(3)} kW
- Final Load: ${results.finalLoad.toFixed(3)} kW
- Refrigeration Capacity: ${results.totalTR.toFixed(2)} TR
- BTU/hr: ${results.totalBTU.toFixed(0)} BTU/hr
- Daily Energy: ${results.dailyKJ.toFixed(0)} kJ/day

AIR FLOW REQUIREMENTS:
- Required CFM: ${results.airFlowInfo.requiredCfm} CFM
- Recommended CFM: ${results.airFlowInfo.recommendedCfm.toFixed(0)} CFM

Generated by Enzo CoolCalc
Date: ${new Date().toLocaleDateString()}
    `;

    try {
      await Share.share({
        message: reportData,
        title: 'Cold Room Cooling Load Report'
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Results" step={5} totalSteps={5} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to calculate results. Please check your inputs.</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Cold Room Results" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Final Results Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Final Cooling Load</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Load:</Text>
            <Text style={styles.summaryValue}>{results.finalLoad.toFixed(2)} kW</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Refrigeration Tons:</Text>
            <Text style={styles.summaryValue}>{results.totalTR.toFixed(2)} TR</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>BTU/hr:</Text>
            <Text style={styles.summaryValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Daily Energy:</Text>
            <Text style={styles.summaryValue}>{results.dailyKJ.toFixed(0)} kJ/day</Text>
          </View>
        </View>

        {/* Load Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>1. Transmission Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Walls</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.walls.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Ceiling</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.ceiling.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Floor</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.transmission.floor.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>2. Product Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>3. Respiration Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.respiration.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>4. Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>5. Door Opening Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.doorOpening.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>6. Miscellaneous Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Equipment</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Occupancy</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Lighting</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.miscellaneous.lighting.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>7. Heater Loads</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters.total.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Peripheral</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.peripheral.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Door</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.door.toFixed(3)} kW</Text>
            </View>
            <View style={styles.subBreakdownRow}>
              <Text style={styles.subBreakdownLabel}>• Steam</Text>
              <Text style={styles.subBreakdownValue}>{results.breakdown.heaters.steam.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Before Safety:</Text>
              <Text style={styles.totalValue}>{results.totalBeforeSafety.toFixed(3)} kW</Text>
            </View>
            
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (10%):</Text>
              <Text style={styles.breakdownValue}>{results.safetyFactorLoad.toFixed(3)} kW</Text>
            </View>
            
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>Final Load:</Text>
              <Text style={styles.finalValue}>{results.finalLoad.toFixed(3)} kW</Text>
            </View>
          </View>
        </View>

        {/* Room & Storage Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Room & Storage Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Room Volume:</Text>
              <Text style={styles.infoValue}>{results.volume.toFixed(2)} m³</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Temperature Difference:</Text>
              <Text style={styles.infoValue}>{results.temperatureDifference.toFixed(1)}°C</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Maximum Storage:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.maximum.toFixed(0)} kg</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Storage Utilization:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.utilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available Capacity:</Text>
              <Text style={styles.infoValue}>{results.storageCapacity.availableCapacity.toFixed(0)} kg</Text>
            </View>
          </View>
        </View>

        {/* Air Flow Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Flow Requirements</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Required CFM:</Text>
              <Text style={styles.infoValue}>{results.airFlowInfo.requiredCfm} CFM</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recommended CFM:</Text>
              <Text style={styles.infoValue}>{results.airFlowInfo.recommendedCfm.toFixed(0)} CFM</Text>
            </View>
          </View>
        </View>

        {/* Export Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <FileText color="#FFFFFF" size={20} strokeWidth={2} />
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
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
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  subBreakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  subBreakdownValue: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#10B981',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#059669',
    borderBottomWidth: 0,
    backgroundColor: '#F0FDF4',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 12,
  },
  finalLabel: {
    fontSize: 18,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  finalValue: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});