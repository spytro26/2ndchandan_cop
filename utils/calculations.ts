import { THERMAL_DATA } from '@/constants/thermalData';
import { PRODUCTS, STORAGE_FACTORS } from '@/constants/productData';

interface RoomData {
  length: string;
  width: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
}

interface ConditionsData {
  externalTemp: string;
  internalTemp: string;
  operatingHours: string;
  pullDownTime: string;
}

interface ProductData {
  productType: string;
  dailyLoad: string;
  incomingTemp: string;
  outgoingTemp: string;
  storageType: string;
  numberOfPeople: string;
  workingHours: string;
  lightingWattage: string;
  equipmentLoad: string;
}

export function calculateCoolingLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values
  const length = parseFloat(roomData.length) || 4.0;
  const width = parseFloat(roomData.width) || 3.0;
  const height = parseFloat(roomData.height) || 2.5;
  const doorWidth = parseFloat(roomData.doorWidth) || 1.0;
  const doorHeight = parseFloat(roomData.doorHeight) || 2.0;
  const doorOpenings = parseFloat((roomData as any).doorOpenings) || 0;
  const insulationType = (roomData as any).insulationType || 'PUF';
  const insulationThickness = (roomData as any).insulationThickness || 150;
  
  const externalTemp = parseFloat(conditionsData.externalTemp) || 35;
  const internalTemp = parseFloat(conditionsData.internalTemp) || -18;
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  const pullDownTime = parseFloat(conditionsData.pullDownTime) || 10;
  
  const dailyLoad = parseFloat(productData.dailyLoad) || 1000;
  const incomingTemp = parseFloat(productData.incomingTemp) || 25;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || -18;
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 4;
  const lightingWattage = parseFloat(productData.lightingWattage) || 150;
  const equipmentLoad = parseFloat(productData.equipmentLoad) || 300;
  
  // Calculate areas and volume
  const wallArea = 2 * (length + width) * height;
  const ceilingArea = length * width;
  const floorArea = length * width;
  const volume = length * width * height;
  const doorArea = doorWidth * doorHeight;
  
  // Temperature difference
  const temperatureDifference = externalTemp - internalTemp;
  
  // Get U-factor from construction data
  const insulationTypeKey = insulationType as keyof typeof THERMAL_DATA.uFactors;
  const thickness = insulationThickness as keyof typeof THERMAL_DATA.uFactors.PUF;
  const uFactor = THERMAL_DATA.uFactors[insulationTypeKey]?.[thickness] || 0.17;
  
  // Get product and storage data
  const product = PRODUCTS[productData.productType as keyof typeof PRODUCTS] || PRODUCTS["General Food Items"];
  const storageFactor = STORAGE_FACTORS[productData.storageType as keyof typeof STORAGE_FACTORS] || STORAGE_FACTORS["Boxed"];
  
  // Calculate storage capacity
  const maxStorageCapacity = volume * product.density * product.storageEfficiency * storageFactor;
  const storageUtilization = (dailyLoad / maxStorageCapacity) * 100;
  
  // 1. Transmission Load Calculations
  const transmissionLoad = {
    walls: (uFactor * wallArea * temperatureDifference) / 1000, // Convert to kW
    ceiling: (uFactor * ceilingArea * temperatureDifference) / 1000,
    floor: (uFactor * floorArea * temperatureDifference) / 1000,
    total: 0
  };
  transmissionLoad.total = transmissionLoad.walls + transmissionLoad.ceiling + transmissionLoad.floor;
  
  // 2. Enhanced Product Load Calculations
  let sensibleAbove = 0;
  let latentLoad = 0;
  let sensibleBelow = 0;
  
  // Sensible heat above freezing
  if (incomingTemp > product.freezingPoint) {
    sensibleAbove = (dailyLoad * product.specificHeatAbove * (incomingTemp - product.freezingPoint)) / (pullDownTime * 3.6);
  }
  
  // Latent heat (freezing process)
  if (outgoingTemp < product.freezingPoint && incomingTemp > product.freezingPoint) {
    latentLoad = (dailyLoad * product.latentHeat) / (pullDownTime * 3.6);
  }
  
  // Sensible heat below freezing
  if (outgoingTemp < product.freezingPoint) {
    sensibleBelow = (dailyLoad * product.specificHeatBelow * (product.freezingPoint - outgoingTemp)) / (pullDownTime * 3.6);
  }
  
  const productLoad = {
    sensibleAbove: sensibleAbove,
    latent: latentLoad,
    sensibleBelow: sensibleBelow,
    total: sensibleAbove + latentLoad + sensibleBelow
  };
  
  // 3. Air Infiltration Load
  const airChangeRate = THERMAL_DATA.airChangeRates.freezer;
  const airInfiltrationLoad = (volume * THERMAL_DATA.airDensity * THERMAL_DATA.airSpecificHeat * temperatureDifference * airChangeRate) / 3.6; // Convert to kW
  
  // 4. Internal Loads
  const internalLoads = {
    people: numberOfPeople * THERMAL_DATA.personHeatLoad * (workingHours / 24),
    lighting: (lightingWattage * (operatingHours / 24)) / 1000,
    equipment: equipmentLoad / 1000,
    total: 0
  };
  internalLoads.total = internalLoads.people + internalLoads.lighting + internalLoads.equipment;
  
  // 5. Enhanced Door Opening Load
  const doorLoad = (doorOpenings * doorArea * 3.0 * Math.sqrt(temperatureDifference)) / 24 / 1000; // Convert to kW
  
  // 6. Total Load Calculation
  const totalLoad = transmissionLoad.total + productLoad.total + airInfiltrationLoad + internalLoads.total + doorLoad;
  
  // 7. Apply Safety Factor
  const totalLoadWithSafety = totalLoad * THERMAL_DATA.safetyFactor;
  
  return {
    dimensions: { length, width, height },
    doorDimensions: { width: doorWidth, height: doorHeight },
    areas: {
      wall: wallArea,
      ceiling: ceilingArea,
      floor: floorArea,
      door: doorArea
    },
    volume,
    storageCapacity: {
      maximum: maxStorageCapacity,
      utilization: storageUtilization,
      storageFactor: storageFactor,
      storageType: productData.storageType
    },
    temperatureDifference,
    pullDownTime,
    construction: {
      type: insulationType,
      thickness: insulationThickness,
      uFactor
    },
    transmissionLoad,
    productInfo: {
      type: productData.productType,
      mass: dailyLoad,
      incomingTemp,
      outgoingTemp,
      properties: product
    },
    productLoad,
    airChangeRate,
    airInfiltrationLoad,
    internalLoads,
    doorLoad,
    doorOpenings,
    workingHours,
    totalLoad,
    totalLoadWithSafety
  };
}