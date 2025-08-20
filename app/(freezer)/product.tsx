import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FREEZER_DEFAULTS } from '@/constants/freezerData';
import { Header } from '@/components/Header';
import { InputCard } from '@/components/InputCard';
import { PickerCard } from '@/components/PickerCard';
import { PRODUCTS, STORAGE_FACTORS } from '@/constants/productData';

export default function ProductScreen() {
  const [product, setProduct] = useState({
    productType: FREEZER_DEFAULTS.productType,
    dailyLoad: FREEZER_DEFAULTS.dailyProductLoad.toString(),
    incomingTemp: FREEZER_DEFAULTS.productIncomingTemp.toString(),
    outgoingTemp: FREEZER_DEFAULTS.productOutgoingTemp.toString(),
    storageType: FREEZER_DEFAULTS.storageType,
    numberOfPeople: FREEZER_DEFAULTS.numberOfPeople.toString(),
    workingHours: '16', // Updated from 4 to 16 hours
    lightingWattage: FREEZER_DEFAULTS.lightingWattage.toString(),
    equipmentLoad: FREEZER_DEFAULTS.equipmentLoad.toString(),
    // Equipment details
    fanMotorRating: FREEZER_DEFAULTS.fanMotorRating.toString(),
    numberOfFans: FREEZER_DEFAULTS.numberOfFans.toString(),
    fanOperatingHours: FREEZER_DEFAULTS.fanOperatingHours.toString(),
    fanAirFlowRate: '2000', // CFM per fan
    doorHeatersLoad: FREEZER_DEFAULTS.doorHeatersLoad.toString(),
    trayHeatersLoad: FREEZER_DEFAULTS.trayHeatersLoad.toString(),
    peripheralHeatersLoad: FREEZER_DEFAULTS.peripheralHeatersLoad.toString(),
    // Advanced mode properties
    customCpAbove: '',
    customCpBelow: '',
    customLatentHeat: '',
  });

  const [advancedMode, setAdvancedMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Save data immediately when any input changes
  const handleInputChange = (key: keyof typeof product, value: string) => {
    const newProduct = { ...product, [key]: value };
    setProduct(newProduct);
    // Save immediately
    AsyncStorage.setItem('productData', JSON.stringify(newProduct)).catch(console.error);
  };

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem('productData');
      if (saved) {
        setProduct(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading product data:', error);
    }
  };

  const productOptions = Object.keys(PRODUCTS).map(key => ({
    label: key,
    value: key,
  }));

  const storageOptions = Object.keys(STORAGE_FACTORS).map(key => ({
    label: key,
    value: key,
  }));

  const selectedProduct = PRODUCTS[product.productType as keyof typeof PRODUCTS];
  const selectedStorageFactor = STORAGE_FACTORS[product.storageType as keyof typeof STORAGE_FACTORS];
  
  // Calculate storage capacity (will need room dimensions from AsyncStorage)
  const [roomVolume, setRoomVolume] = useState(0);
  
  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const roomData = await AsyncStorage.getItem('roomData');
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

  const maxStorageCapacity = roomVolume * (selectedProduct?.density || 800) * (selectedProduct?.storageEfficiency || 0.65) * (selectedStorageFactor || 0.65);
  const storageUtilization = maxStorageCapacity > 0 ? (parseFloat(product.dailyLoad) / maxStorageCapacity) * 100 : 0;
  const totalFanLoad = (parseFloat(product.fanMotorRating) || 0) * (parseFloat(product.numberOfFans) || 0);
  const totalHeaterLoad = (parseFloat(product.doorHeatersLoad) || 0) + (parseFloat(product.trayHeatersLoad) || 0) + (parseFloat(product.peripheralHeatersLoad) || 0);
  const totalAirFlow = (parseFloat(product.numberOfFans) || 0) * (parseFloat(product.fanAirFlowRate) || 0);

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Product & Equipment Details" step={3} totalSteps={4} />
      
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
          
          <PickerCard
            label="Storage Type"
            value={product.storageType}
            options={storageOptions}
            onValueChange={(value) => handleInputChange('storageType', value)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.advancedModeHeader}>
            <Text style={styles.sectionTitle}>Advanced Thermal Properties</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Advanced Mode</Text>
              <Switch
                value={advancedMode}
                onValueChange={setAdvancedMode}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={advancedMode ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>
          
          {advancedMode ? (
            <>
              <InputCard 
                label="Specific Heat Above Freezing (Cp Above)" 
                unit="kJ/kg·K" 
                value={product.customCpAbove || (selectedProduct?.specificHeatAbove || 3.0).toString()} 
                onChangeText={(value) => handleInputChange('customCpAbove', value)} 
              />
              <InputCard 
                label="Specific Heat Below Freezing (Cp Below)" 
                unit="kJ/kg·K" 
                value={product.customCpBelow || (selectedProduct?.specificHeatBelow || 1.6).toString()} 
                onChangeText={(value) => handleInputChange('customCpBelow', value)} 
              />
              <InputCard 
                label="Latent Heat of Freezing" 
                unit="kJ/kg" 
                value={product.customLatentHeat || (selectedProduct?.latentHeat || 200).toString()} 
                onChangeText={(value) => handleInputChange('customLatentHeat', value)} 
              />
            </>
          ) : (
            <View style={styles.propertiesCard}>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Specific Heat (Above Freezing):</Text>
                <Text style={styles.propertyValue}>{selectedProduct?.specificHeatAbove || 3.0} kJ/kg·K</Text>
              </View>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Specific Heat (Below Freezing):</Text>
                <Text style={styles.propertyValue}>{selectedProduct?.specificHeatBelow || 1.6} kJ/kg·K</Text>
              </View>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Latent Heat of Freezing:</Text>
                <Text style={styles.propertyValue}>{selectedProduct?.latentHeat || 200} kJ/kg</Text>
              </View>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Freezing Point:</Text>
                <Text style={styles.propertyValue}>{selectedProduct?.freezingPoint || -2.0} °C</Text>
              </View>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Density:</Text>
                <Text style={styles.propertyValue}>{selectedProduct?.density || 800} kg/m³</Text>
              </View>
              <View style={styles.propertyRow}>
                <Text style={styles.propertyLabel}>Storage Efficiency:</Text>
                <Text style={styles.propertyValue}>{((selectedProduct?.storageEfficiency || 0.65) * 100).toFixed(0)}%</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Loads</Text>
          
          <InputCard 
            label="Fan Motor Rating" 
            unit="kW" 
            value={product.fanMotorRating} 
            onChangeText={(value) => handleInputChange('fanMotorRating', value)} 
          />
          
          <InputCard 
            label="Number of Fans" 
            unit="units" 
            value={product.numberOfFans} 
            onChangeText={(value) => handleInputChange('numberOfFans', value)} 
          />
          
          <InputCard 
            label="Fan Operating Hours" 
            unit="hrs" 
            value={product.fanOperatingHours} 
            onChangeText={(value) => handleInputChange('fanOperatingHours', value)} 
          />
          
          <InputCard 
            label="Fan Air Flow Rate" 
            unit="CFM" 
            value={product.fanAirFlowRate} 
            onChangeText={(value) => handleInputChange('fanAirFlowRate', value)} 
          />
          
          <InputCard 
            label="Door Heaters Load" 
            unit="kW" 
            value={product.doorHeatersLoad} 
            onChangeText={(value) => handleInputChange('doorHeatersLoad', value)} 
          />
          
          <InputCard 
            label="Tray Heaters Load" 
            unit="kW" 
            value={product.trayHeatersLoad} 
            onChangeText={(value) => handleInputChange('trayHeatersLoad', value)} 
          />
          
          <InputCard 
            label="Peripheral Heaters Load" 
            unit="kW" 
            value={product.peripheralHeatersLoad} 
            onChangeText={(value) => handleInputChange('peripheralHeatersLoad', value)} 
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
            label="Hours of Occupancy" 
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
            label="Other Equipment Load" 
            unit="W" 
            value={product.equipmentLoad} 
            onChangeText={(value) => handleInputChange('equipmentLoad', value)} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Summary</Text>
          
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
              <Text style={styles.summaryLabel}>Total Air Flow:</Text>
              <Text style={styles.summaryValue}>{(totalAirFlow || 0).toFixed(0)} CFM</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Fan Load:</Text>
              <Text style={styles.summaryValue}>{(totalFanLoad || 0).toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Heater Load:</Text>
              <Text style={styles.summaryValue}>{(totalHeaterLoad || 0).toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>People Load:</Text>
              <Text style={styles.summaryValue}>{((parseFloat(product.numberOfPeople) || 0) * 0.407 * ((parseFloat(product.workingHours) || 0) / 24)).toFixed(3)} kW</Text>
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
  advancedModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
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