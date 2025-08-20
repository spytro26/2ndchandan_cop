import { THERMAL_DATA } from '@/constants/thermalData';
import { PRODUCTS, STORAGE_FACTORS } from '@/constants/productData';
import { ENHANCED_CONSTANTS } from '@/constants/freezerData';

interface RoomData {
  length: string;
  width: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
  doorOpenings: string;
  insulationType: string;
  insulationThickness: number;
  internalFloorThickness: string;
  numberOfFloors: string;
}

interface ConditionsData {
  externalTemp: string;
  internalTemp: string;
  operatingHours: string;
  pullDownTime: string;
  roomHumidity: string;
  airFlowPerFan: string;
  steamHumidifierLoad: string;
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
  fanMotorRating: string;
  numberOfFans: string;
  fanOperatingHours: string;
  doorHeatersLoad: string;
  trayHeatersLoad: string;
  peripheralHeatersLoad: string;
  customCpAbove?: string;
  customCpBelow?: string;
  customLatentHeat?: string;
}

export function calculateEnhancedFreezerLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values with enhanced defaults
  const length = parseFloat(roomData.length) || 4.0;
  const width = parseFloat(roomData.width) || 3.0;
  const height = parseFloat(roomData.height) || 2.5;
  const doorWidth = parseFloat(roomData.doorWidth) || 1.0;
  const doorHeight = parseFloat(roomData.doorHeight) || 2.0;
  const doorOpenings = parseFloat(roomData.doorOpenings) || 15;
  const insulationType = roomData.insulationType || 'PUF';
  const insulationThickness = roomData.insulationThickness || 150;
  const internalFloorThickness = parseFloat(roomData.internalFloorThickness) || 150;
  const numberOfFloors = parseFloat(roomData.numberOfFloors) || 1;
  
  const externalTemp = parseFloat(conditionsData.externalTemp) || 35;
  const internalTemp = parseFloat(conditionsData.internalTemp) || -18;
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  const pullDownTime = parseFloat(conditionsData.pullDownTime) || 10;
  const roomHumidity = parseFloat(conditionsData.roomHumidity) || 85;
  const airFlowPerFan = parseFloat(conditionsData.airFlowPerFan) || 2000;
  const steamHumidifierLoad = parseFloat(conditionsData.steamHumidifierLoad) || 0;
  
  const dailyLoad = parseFloat(productData.dailyLoad) || 1000;
  const incomingTemp = parseFloat(productData.incomingTemp) || 25;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || -18;
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 4;
  const lightingWattage = parseFloat(productData.lightingWattage) || 150;
  const equipmentLoad = parseFloat(productData.equipmentLoad) || 300;
  
  // Equipment loads
  const fanMotorRating = parseFloat(productData.fanMotorRating) || 0.37;
  const numberOfFans = parseFloat(productData.numberOfFans) || 6;
  const fanOperatingHours = parseFloat(productData.fanOperatingHours) || 24;
  const fanAirFlowRate = parseFloat(productData.fanAirFlowRate || '2000') || 2000;
  const doorHeatersLoad = parseFloat(productData.doorHeatersLoad) || 0.24;
  const trayHeatersLoad = parseFloat(productData.trayHeatersLoad) || 2.0;
  const peripheralHeatersLoad = parseFloat(productData.peripheralHeatersLoad) || 0;
  
  // Calculate areas and volume
  const wallArea = 2 * (length * height) + 2 * (width * height);
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
  
  // Get product data (use custom values if in advanced mode)
  const product = PRODUCTS[productData.productType as keyof typeof PRODUCTS] || PRODUCTS["General Food Items"];
  const storageFactor = STORAGE_FACTORS[productData.storageType as keyof typeof STORAGE_FACTORS] || STORAGE_FACTORS["Boxed"];
  
  // Use custom thermal properties if provided
  const specificHeatAbove = productData.customCpAbove ? parseFloat(productData.customCpAbove) : product.specificHeatAbove;
  const specificHeatBelow = productData.customCpBelow ? parseFloat(productData.customCpBelow) : product.specificHeatBelow;
  const latentHeat = productData.customLatentHeat ? parseFloat(productData.customLatentHeat) : product.latentHeat;
  
  // Calculate storage capacity
  const maxStorageCapacity = volume * (product?.density || 800) * (product?.storageEfficiency || 0.65) * (storageFactor || 0.65);
  const storageUtilization = (dailyLoad / maxStorageCapacity) * 100;
  
  // 1. EXACT Excel Formula: Transmission Load (Q = U × A × ΔT × hrs / 1000)
  const calculateTransmissionLoad = () => {
    const tempDiff = temperatureDifference;
    const hours = operatingHours;
    
    const wallLoad = (uFactor * wallArea * tempDiff * hours) / 1000;
    const ceilingLoad = (uFactor * ceilingArea * tempDiff * hours) / 1000;
    const floorLoad = (uFactor * floorArea * tempDiff * hours) / 1000;
    
    return {
      walls: wallLoad,
      ceiling: ceilingLoad,
      floor: floorLoad,
      total: wallLoad + ceilingLoad + floorLoad,
      // For detailed display
      wallsKJDay: uFactor * wallArea * tempDiff * hours,
      ceilingKJDay: uFactor * ceilingArea * tempDiff * hours,
      floorKJDay: uFactor * floorArea * tempDiff * hours
    };
  };
  
  // 2. EXACT Excel Formula: Enhanced Product Load (3-stage calculation)
  const calculateProductLoad = () => {
    const mass = dailyLoad;
    const pullDownHours = pullDownTime;
    
    let sensibleAbove = 0;
    let latentLoad = 0;
    let sensibleBelow = 0;
    
    // Stage 1: Sensible heat above freezing
    if (incomingTemp > (product?.freezingPoint || -2)) {
      sensibleAbove = (mass * specificHeatAbove * (incomingTemp - (product?.freezingPoint || -2))) / (pullDownHours * 3.6);
    }
    
    // Stage 2: Latent heat during freezing
    if (outgoingTemp < (product?.freezingPoint || -2) && incomingTemp > (product?.freezingPoint || -2)) {
      latentLoad = (mass * latentHeat) / (pullDownHours * 3.6);
    }
    
    // Stage 3: Sensible heat below freezing
    if (outgoingTemp < (product?.freezingPoint || -2)) {
      sensibleBelow = (mass * specificHeatBelow * Math.abs((product?.freezingPoint || -2) - outgoingTemp)) / (pullDownHours * 3.6);
    }
    
    return {
      sensibleAbove,
      latent: latentLoad,
      sensibleBelow,
      total: sensibleAbove + latentLoad + sensibleBelow,
      // For detailed display (kJ/day)
      sensibleAboveKJDay: mass * specificHeatAbove * (incomingTemp - (product?.freezingPoint || -2)),
      latentKJDay: mass * latentHeat,
      sensibleBelowKJDay: mass * specificHeatBelow * Math.abs((product?.freezingPoint || -2) - outgoingTemp)
    };
  };
  
  // 3. EXACT Excel Formula: Air Change Load (L/S method)
  const calculateAirChangeLoad = () => {
    const roomVolume = volume;
    const airChangeRate = ENHANCED_CONSTANTS.airChangeRates.freezer;
    
    // Excel uses L/S method
    const airFlowLperS = (roomVolume * 1000 * airChangeRate) / 3600; // L/S
    const enthalpyDiff = ENHANCED_CONSTANTS.enthalpyDiff; // kJ/L
    const hoursOfLoad = operatingHours;
    
    const airLoad = (airFlowLperS * enthalpyDiff * hoursOfLoad) / 1000; // kW
    
    return {
      load: airLoad,
      airFlowLperS,
      enthalpyDiff,
      airFlowKJDay: airFlowLperS * enthalpyDiff * hoursOfLoad
    };
  };
  
  // 4. CRITICAL FIX: Door Opening Load (Excel-accurate formula)
  const calculateDoorLoad = () => {
    const doorClearOpening = doorWidth * doorHeight; // m²
    
    // Door heaters load (automatic based on door size)
    const doorHeatersLoadCalc = doorClearOpening > 1.8 ? 0.24 : 0; // kW
    
    // Door infiltration using Excel method: (openings × area × 1800) / (operating hours × 1000)
    const doorInfiltrationLoad = (doorOpenings * doorClearOpening * 1800) / (operatingHours * 1000);
    
    const totalDoorLoad = doorInfiltrationLoad + doorHeatersLoadCalc;
    
    return {
      infiltration: doorInfiltrationLoad,
      heaters: doorHeatersLoadCalc,
      total: totalDoorLoad,
      doorClearOpening,
      // For detailed display
      infiltrationKJDay: doorOpenings * doorClearOpening * 1800 * operatingHours / 1000
    };
  };
  
  // 5. Enhanced Internal Loads (separated by type)
  const calculateInternalLoads = () => {
    const occupancyLoad = (numberOfPeople * 0.407 * workingHours) / 24; // kW
    const lightingLoad = (lightingWattage * operatingHours) / (1000 * 24); // kW
    const otherEquipmentLoad = (equipmentLoad * operatingHours) / (1000 * 24); // kW
    
    // SEPARATE Fan motor load calculation
    const fanMotorLoad = fanMotorRating * numberOfFans * (fanOperatingHours / 24);
    
    // Heater loads
    const doorHeaters = doorHeatersLoad * (operatingHours / 24);
    const trayHeaters = trayHeatersLoad * (operatingHours / 24);
    const peripheralHeaters = peripheralHeatersLoad * (operatingHours / 24);
    
    // Steam humidifiers
    const steamLoad = steamHumidifierLoad * (operatingHours / 24);
    
    return {
      occupancy: occupancyLoad,
      lighting: lightingLoad,
      equipment: otherEquipmentLoad,
      fanMotor: fanMotorLoad,
      doorHeaters: doorHeaters,
      trayHeaters: trayHeaters,
      peripheralHeaters: peripheralHeaters,
      steamHumidifiers: steamLoad,
      total: occupancyLoad + lightingLoad + otherEquipmentLoad + fanMotorLoad + 
             doorHeaters + trayHeaters + peripheralHeaters + steamLoad,
      // For detailed display (kJ/day)
      occupancyKJDay: occupancyLoad * 24 * 3600 / 1000,
      lightingKJDay: lightingLoad * 24 * 3600 / 1000,
      fanMotorKJDay: fanMotorLoad * 24 * 3600 / 1000,
      doorHeatersKJDay: doorHeaters * 24 * 3600 / 1000,
      trayHeatersKJDay: trayHeaters * 24 * 3600 / 1000,
      steamHumidifiersKJDay: steamLoad * 24 * 3600 / 1000
    };
  };
  
  // Calculate all loads
  const transmissionLoad = calculateTransmissionLoad();
  const productLoad = calculateProductLoad();
  const airLoad = calculateAirChangeLoad();
  const doorLoad = calculateDoorLoad();
  const internalLoads = calculateInternalLoads();
  
  // 6. SHR Calculation (Sensible Heat Ratio)
  const totalSensibleLoad = transmissionLoad.total + productLoad.sensibleAbove + productLoad.sensibleBelow + 
                           airLoad.load + internalLoads.occupancy + internalLoads.lighting + 
                           internalLoads.equipment + internalLoads.fanMotor + internalLoads.doorHeaters + 
                           internalLoads.trayHeaters + internalLoads.peripheralHeaters;
  
  const totalLatentLoad = productLoad.latent + internalLoads.steamHumidifiers;
  const totalLoadBeforeSafety = totalSensibleLoad + totalLatentLoad;
  const SHR = totalLoadBeforeSafety > 0 ? totalSensibleLoad / totalLoadBeforeSafety : 1.0;
  
  // 7. Apply Safety Factor
  const safetyFactor = ENHANCED_CONSTANTS.safetyFactor;
  const finalLoad = totalLoadBeforeSafety * safetyFactor;
  const safetyFactorLoad = finalLoad - totalLoadBeforeSafety;
  
  // Conversions
  const totalTR = finalLoad / 3.517; // kW to TR
  const totalBTU = finalLoad * 3412; // kW to BTU/hr
  
  // Air circulation requirements (CFM calculation)
  const totalAirFlow = fanAirFlowRate * numberOfFans; // CFM
  
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
      uFactor,
      floorThickness: internalFloorThickness,
      numberOfFloors
    },
    productInfo: {
      type: productData.productType,
      mass: dailyLoad,
      incomingTemp,
      outgoingTemp,
      properties: {
        ...(product || {}),
        specificHeatAbove,
        specificHeatBelow,
        latentHeat
      }
    },
    conditions: {
      humidity: roomHumidity,
      airFlowPerFan: fanAirFlowRate,
      totalAirFlow,
      steamLoad: steamHumidifierLoad
    },
    breakdown: {
      transmission: transmissionLoad,
      product: productLoad,
      airChange: airLoad,
      doorOpening: doorLoad,
      internal: internalLoads
    },
    // SHR and load summary
    loadSummary: {
      totalSensible: totalSensibleLoad,
      totalLatent: totalLatentLoad,
      SHR: SHR,
      totalBeforeSafety: totalLoadBeforeSafety,
      safetyFactor: safetyFactorLoad,
      finalLoad: finalLoad
    },
    // Conversions
    totalTR: totalTR,
    totalBTU: totalBTU,
    
    // Legacy compatibility
    doorOpenings,
    workingHours,
    totalLoad: totalLoadBeforeSafety,
    totalLoadWithSafety: finalLoad,
    airChangeRate: ENHANCED_CONSTANTS.airChangeRates.freezer,
    
    // Additional data for results display
    productData: {
      fanMotorRating: fanMotorRating.toString(),
      numberOfFans: numberOfFans.toString(),
      fanAirFlowRate: fanAirFlowRate.toString()
    }
  };
}