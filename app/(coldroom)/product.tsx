import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLD_ROOM_DEFAULTS, COLD_ROOM_PRODUCTS } from '@/constants/coldRoomData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { PickerCard } from '@/components/PickerCard';
import { STORAGE_FACTORS } from '@/constants/productData';

export default function ColdRoomProductScreen() {
  const [product, setProduct] = useState({
    productType: COLD_ROOM_DEFAULTS.productType,
    dailyLoad: COLD_ROOM_DEFAULTS.dailyProductLoad.toString(),
    incomingTemp: COLD_ROOM_DEFAULTS.productIncomingTemp.toString(),
    outgoingTemp: COLD_ROOM_DEFAULTS.productOutgoingTemp.toString(),
    specificHeatAbove: COLD_ROOM_DEFAULTS.specificHeatAbove.toString(),
    respirationRate: COLD_ROOM_DEFAULTS.respirationRate.toString(),
    storageType: COLD_ROOM_DEFAULTS.storageType,
    numberOfPeople: COLD_ROOM_DEFAULTS.numberOfPeople.toString(),
    workingHours: COLD_ROOM_DEFAULTS.hoursWorking.toString(),
    lightingWattage: COLD_ROOM_DEFAULTS.lightingWattage.toString(),
    equipmentLoad: COLD_ROOM_DEFAULTS.equipmentLoad.toString(),
  });

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof product, value: string) => {
    const newProduct = { ...product, [key]: value };
    setProduct(newProduct);
    // Save immediately
    AsyncStorage.setItem('coldRoomProductData', JSON.stringify(newProduct)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('coldRoomProductData');
      if (saved) {
        setProduct(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading cold room product data:', error);
    }
  };

  const productOptions = Object.keys(COLD_ROOM_PRODUCTS).map(key => ({
    label: key,
    value: key,
  }));

  const storageOptions = Object.keys(STORAGE_FACTORS).map(key => ({
    label: key,
    value: key,
  }));

  const selectedColdRoomProduct = COLD_ROOM_PRODUCTS[product.productType as keyof typeof COLD_ROOM_PRODUCTS] || COLD_ROOM_PRODUCTS["BANANA"];
  const selectedStorageFactor = STORAGE_FACTORS[product.storageType as keyof typeof STORAGE_FACTORS];
  
  // Calculate storage capacity (will need room dimensions from AsyncStorage)
  const [roomVolume, setRoomVolume] = useState(0);
  
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const roomData = await AsyncStorage.getItem('coldRoomData');
        if (roomData) {
          const room = JSON.parse(roomData);
          const volume = (parseFloat(room.length) || 0) * (parseFloat(room.width) || 0) * (parseFloat(room.height) || 0);
          setRoomVolume(volume);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    };
    loadRoomData();
  }, []);

  const maxStorageCapacity = roomVolume * selectedColdRoomProduct.density * selectedColdRoomProduct.storageEfficiency * selectedStorageFactor;
  const storageUtilization = maxStorageCapacity > 0 ? (parseFloat(product.dailyLoad) / maxStorageCapacity) * 100 : 0;
  const totalInternalLoad = (parseFloat(product.lightingWattage) + parseFloat(product.equipmentLoad)) / 1000;

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Product & Usage Details" step={4} totalSteps={5} />
      
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
            label="Daily Product Load" 
            unit="kg" 
            value={product.dailyLoad} 
            onChangeText={(value) => handleInputChange('dailyLoad', value)} 
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
            label="Specific Heat Above Freezing" 
            unit="kJ/kg·K" 
            value={product.specificHeatAbove} 
            onChangeText={(value) => handleInputChange('specificHeatAbove', value)} 
          />
          
          <InputCard 
            label="Respiration Rate" 
            unit="W/tonne" 
            value={product.respirationRate} 
            onChangeText={(value) => handleInputChange('respirationRate', value)} 
          />
          
          <PickerCard
            label="Storage Type"
            value={product.storageType}
            options={storageOptions}
            onValueChange={(value) => handleInputChange('storageType', value)}
          />
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
            label="Working Hours Inside Room" 
            unit="hrs" 
            value={product.workingHours} 
            onChangeText={(value) => handleInputChange('workingHours', value)} 
          />
          
          <InputCard 
            label="Lighting Load" 
            unit="W" 
            value={product.lightingWattage} 
            onChangeText={(value) => handleInputChange('lightingWattage', value)} 
          />
          
          <InputCard 
            label="Equipment Load" 
            unit="W" 
            value={product.equipmentLoad} 
            onChangeText={(value) => handleInputChange('equipmentLoad', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Thermal Properties</Text>
          
          <View style={styles.propertiesCard}>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Specific Heat:</Text>
              <Text style={styles.propertyValue}>{selectedColdRoomProduct.specificHeatAbove} kJ/kg·K</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Density:</Text>
              <Text style={styles.propertyValue}>{selectedColdRoomProduct.density} kg/m³</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Storage Efficiency:</Text>
              <Text style={styles.propertyValue}>{(selectedColdRoomProduct.storageEfficiency * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Respiration Rate:</Text>
              <Text style={styles.propertyValue}>{selectedColdRoomProduct.respirationRate} W/tonne</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Load Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Max Storage Capacity:</Text>
              <Text style={styles.summaryValue}>{maxStorageCapacity.toFixed(0)} kg</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Storage Utilization:</Text>
              <Text style={styles.summaryValue}>{storageUtilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Internal Equipment:</Text>
              <Text style={styles.summaryValue}>{totalInternalLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Respiration Load:</Text>
              <Text style={styles.summaryValue}>{((parseFloat(product.dailyLoad) / 1000) * parseFloat(product.respirationRate) / 1000).toFixed(3)} kW</Text>
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
    color: '#1E293B',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#EBF8FF',
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