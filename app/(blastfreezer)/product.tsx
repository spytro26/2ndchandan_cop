import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BLAST_FREEZER_DEFAULTS, BLAST_FREEZER_PRODUCTS } from '@/constants/blastFreezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { PickerCard } from '@/components/PickerCard';

export default function BlastFreezerProductScreen() {
  const [product, setProduct] = useState({
    productType: BLAST_FREEZER_DEFAULTS.productType,
    capacityRequired: BLAST_FREEZER_DEFAULTS.capacityRequired.toString(),
    incomingTemp: BLAST_FREEZER_DEFAULTS.incomingTemp.toString(),
    outgoingTemp: BLAST_FREEZER_DEFAULTS.outgoingTemp.toString(),
    storageCapacity: BLAST_FREEZER_DEFAULTS.storageCapacity.toString(),
    numberOfPeople: BLAST_FREEZER_DEFAULTS.numberOfPeople.toString(),
    workingHours: BLAST_FREEZER_DEFAULTS.workingHours.toString(),
    lightLoad: BLAST_FREEZER_DEFAULTS.lightLoad.toString(),
    fanMotorRating: BLAST_FREEZER_DEFAULTS.fanMotorRating.toString(),
    // Heater specifications
    peripheralHeatersQty: BLAST_FREEZER_DEFAULTS.peripheralHeatersQty.toString(),
    peripheralHeatersCapacity: BLAST_FREEZER_DEFAULTS.peripheralHeatersCapacity.toString(),
    doorHeatersQty: BLAST_FREEZER_DEFAULTS.doorHeatersQty.toString(),
    doorHeatersCapacity: BLAST_FREEZER_DEFAULTS.doorHeatersCapacity.toString(),
    trayHeatersQty: BLAST_FREEZER_DEFAULTS.trayHeatersQty.toString(),
    trayHeatersCapacity: BLAST_FREEZER_DEFAULTS.trayHeatersCapacity.toString(),
    drainHeatersQty: BLAST_FREEZER_DEFAULTS.drainHeatersQty.toString(),
    drainHeatersCapacity: BLAST_FREEZER_DEFAULTS.drainHeatersCapacity.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof product, value: string) => {
    const newProduct = { ...product, [key]: value };
    setProduct(newProduct);
    // Save immediately
    AsyncStorage.setItem('blastFreezerProductData', JSON.stringify(newProduct)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('blastFreezerProductData');
      if (saved) {
        setProduct(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading blast freezer product data:', error);
    }
  };

  const productOptions = Object.keys(BLAST_FREEZER_PRODUCTS).map(key => ({
    label: key,
    value: key,
  }));

  const selectedProduct = BLAST_FREEZER_PRODUCTS[product.productType as keyof typeof BLAST_FREEZER_PRODUCTS];
  
  // Calculate storage capacity (will need room dimensions from AsyncStorage)
  const [roomVolume, setRoomVolume] = useState(0);
  
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
        if (roomData) {
          const room = JSON.parse(roomData);
          const volume = (parseFloat(room.length) || 0) * (parseFloat(room.breadth) || 0) * (parseFloat(room.height) || 0);
          setRoomVolume(volume);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    };
    loadRoomData();
  }, []);

  const maximumStorage = roomVolume * parseFloat(product.storageCapacity);
  const storageUtilization = maximumStorage > 0 ? (parseFloat(product.capacityRequired) / maximumStorage) * 100 : 0;
  const totalHeaterLoad = (parseFloat(product.peripheralHeatersQty) * parseFloat(product.peripheralHeatersCapacity)) +
                         (parseFloat(product.doorHeatersQty) * parseFloat(product.doorHeatersCapacity)) +
                         (parseFloat(product.trayHeatersQty) * parseFloat(product.trayHeatersCapacity)) +
                         (parseFloat(product.drainHeatersQty) * parseFloat(product.drainHeatersCapacity));

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Product & Load Details" step={4} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>
          
          <PickerCard
            label="Product Type"
            value={product.productType}
            options={productOptions}
            onValueChange={(value) => handleInputChange('productType', value)}
          />
          
          <InputCard 
            label="Capacity Required per Batch" 
            unit="kg" 
            value={product.capacityRequired} 
            onChangeText={(value) => handleInputChange('capacityRequired', value)} 
          />
          
          <InputCard 
            label="Product Incoming Temperature" 
            unit="°C" 
            value={product.incomingTemp} 
            onChangeText={(value) => handleInputChange('incomingTemp', value)} 
          />
          
          <InputCard 
            label="Product Outgoing Temperature" 
            unit="°C" 
            value={product.outgoingTemp} 
            onChangeText={(value) => handleInputChange('outgoingTemp', value)} 
          />
          
          <InputCard 
            label="Storage Capacity Density" 
            unit="kg/m³" 
            value={product.storageCapacity} 
            onChangeText={(value) => handleInputChange('storageCapacity', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Thermal Properties</Text>
          
          <View style={styles.propertiesCard}>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Specific Heat (Above Freezing):</Text>
              <Text style={styles.propertyValue}>{selectedProduct.specificHeatAbove} kJ/kg·K</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Specific Heat (Below Freezing):</Text>
              <Text style={styles.propertyValue}>{selectedProduct.specificHeatBelow} kJ/kg·K</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Latent Heat of Freezing:</Text>
              <Text style={styles.propertyValue}>{selectedProduct.latentHeat} kJ/kg</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Freezing Point:</Text>
              <Text style={styles.propertyValue}>{selectedProduct.freezingPoint} °C</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Density:</Text>
              <Text style={styles.propertyValue}>{selectedProduct.density} kg/m³</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Storage Efficiency:</Text>
              <Text style={styles.propertyValue}>{(selectedProduct.storageEfficiency * 100).toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operational Loads</Text>
          
          <InputCard 
            label="Number of People" 
            unit="persons" 
            value={product.numberOfPeople} 
            onChangeText={(value) => handleInputChange('numberOfPeople', value)} 
          />
          
          <InputCard 
            label="People Working Hours" 
            unit="hrs" 
            value={product.workingHours} 
            onChangeText={(value) => handleInputChange('workingHours', value)} 
          />
          
          <InputCard 
            label="Light Load" 
            unit="kW" 
            value={product.lightLoad} 
            onChangeText={(value) => handleInputChange('lightLoad', value)} 
          />
          
          <InputCard 
            label="Fan Motor Rating" 
            unit="kW" 
            value={product.fanMotorRating} 
            onChangeText={(value) => handleInputChange('fanMotorRating', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Load Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Max Storage Capacity:</Text>
              <Text style={styles.summaryValue}>{maximumStorage.toFixed(0)} kg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Storage Utilization:</Text>
              <Text style={styles.summaryValue}>{storageUtilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Heater Load:</Text>
              <Text style={styles.summaryValue}>{totalHeaterLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>People Load:</Text>
              <Text style={styles.summaryValue}>{(parseFloat(product.numberOfPeople) * 1.8 * (parseFloat(product.workingHours) / 24)).toFixed(3)} kW</Text>
            </View>
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
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  propertyLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  propertyValue: {
    fontSize: 13,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});