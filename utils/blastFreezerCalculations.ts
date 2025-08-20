import { BLAST_FREEZER_CONSTANTS, BLAST_FREEZER_PRODUCTS, calculateUFactor } from '@/constants/blastFreezerData';

interface RoomData {
  length: string;
  breadth: string;
  height: string;
  doorWidth: string;
  doorHeight: string;
  doorClearOpening: string;
  insulationType: string;
  wallThickness: number;
  ceilingThickness: number;
  floorThickness: number;
  internalFloorThickness: string;
}

interface ConditionsData {
  ambientTemp: string;
  roomTemp: string;
  batchHours: string;
  operatingHours: string;
}

interface ProductData {
  productType: string;
  capacityRequired: string;
  incomingTemp: string;
  outgoingTemp: string;
  storageCapacity: string;
  numberOfPeople: string;
  workingHours: string;
  lightLoad: string;
  fanMotorRating: string;
  peripheralHeatersQty: string;
  peripheralHeatersCapacity: string;
  doorHeatersQty: string;
  doorHeatersCapacity: string;
  trayHeatersQty: string;
  trayHeatersCapacity: string;
  drainHeatersQty: string;
  drainHeatersCapacity: string;
  airFlowPerFan: string;
}

export function calculateBlastFreezerLoad(
  roomData: RoomData, 
  conditionsData: ConditionsData, 
  productData: ProductData
) {
  // Parse input values
  const length = parseFloat(roomData.length) || 5.0;
  const breadth = parseFloat(roomData.breadth) || 5.0;
  const height = parseFloat(roomData.height) || 3.5;
  const doorWidth = parseFloat(roomData.doorWidth) || 2.1;
  const doorHeight = parseFloat(roomData.doorHeight) || 2.1;
  const doorClearOpening = parseFloat(roomData.doorClearOpening) || 2100;
  const insulationType = roomData.insulationType || 'PUF';
  const wallThickness = roomData.wallThickness || 150;
  const ceilingThickness = roomData.ceilingThickness || 150;
  const floorThickness = roomData.floorThickness || 150;
  const internalFloorThickness = parseFloat(roomData.internalFloorThickness) || 150;
  
  const ambientTemp = parseFloat(conditionsData.ambientTemp) || 43;
  const roomTemp = parseFloat(conditionsData.roomTemp) || -35;
  const batchHours = parseFloat(conditionsData.batchHours) || 8;
  const operatingHours = parseFloat(conditionsData.operatingHours) || 24;
  
  const capacityRequired = parseFloat(productData.capacityRequired) || 2000;
  const incomingTemp = parseFloat(productData.incomingTemp) || -5;
  const outgoingTemp = parseFloat(productData.outgoingTemp) || -30;
  const storageCapacity = parseFloat(productData.storageCapacity) || 4;
  const numberOfPeople = parseFloat(productData.numberOfPeople) || 2;
  const workingHours = parseFloat(productData.workingHours) || 4;
  const lightLoad = parseFloat(productData.lightLoad) || 0.1;
  const fanMotorRating = parseFloat(productData.fanMotorRating) || 0.37;
  
  // Heater loads
  const peripheralHeatersQty = parseFloat(productData.peripheralHeatersQty) || 1;
  const peripheralHeatersCapacity = parseFloat(productData.peripheralHeatersCapacity) || 1.5;
  const doorHeatersQty = parseFloat(productData.doorHeatersQty) || 1;
  const doorHeatersCapacity = parseFloat(productData.doorHeatersCapacity) || 0.27;
  const trayHeatersQty = parseFloat(productData.trayHeatersQty) || 1;
  const trayHeatersCapacity = parseFloat(productData.trayHeatersCapacity) || 2.2;
  const drainHeatersQty = parseFloat(productData.drainHeatersQty) || 1;
  const drainHeatersCapacity = parseFloat(productData.drainHeatersCapacity) || 0.04;
  const airFlowPerFan = parseFloat(productData.airFlowPerFan) || 5847;
  
  // Calculate areas and volume
  const wallArea = 2 * (length * height) + 2 * (breadth * height);
  const ceilingArea = length * breadth;
  const floorArea = length * breadth;
  const volume = length * breadth * height;
  const doorArea = doorWidth * doorHeight;
  
  // Temperature difference
  const temperatureDifference = ambientTemp - roomTemp;
  
  // Get product data
  const product = BLAST_FREEZER_PRODUCTS[productData.productType as keyof typeof BLAST_FREEZER_PRODUCTS] || BLAST_FREEZER_PRODUCTS["General Food Items"];
  
  // Calculate storage capacity
  const maximumStorage = volume * storageCapacity * product.storageEfficiency;
  const storageUtilization = (capacityRequired / maximumStorage) * 100;
  
  // Calculate dynamic U-factors based on insulation type and thickness
  const wallUFactor = calculateUFactor(insulationType, wallThickness);
  const ceilingUFactor = calculateUFactor(insulationType, ceilingThickness);
  const floorUFactor = calculateUFactor(insulationType, floorThickness);
  
  // 1. EXACT Excel Formula: Transmission Load (Q = U × A × ΔT / 1000)
  const calculateTransmissionLoad = () => {
    const tempDiff = temperatureDifference;
    
    const wallLoad = (wallUFactor * wallArea * tempDiff) / 1000; // kW
    const ceilingLoad = (ceilingUFactor * ceilingArea * tempDiff) / 1000; // kW
    const floorLoad = (floorUFactor * floorArea * tempDiff) / 1000; // kW
    
    return {
      walls: wallLoad,
      ceiling: ceilingLoad,
      floor: floorLoad,
      total: wallLoad + ceilingLoad + floorLoad,
      // Convert to TR
      wallsTR: wallLoad / 3.517,
      ceilingTR: ceilingLoad / 3.517,
      floorTR: floorLoad / 3.517,
      totalTR: (wallLoad + ceilingLoad + floorLoad) / 3.517
    };
  };
  
  // 2. EXACT Excel Formula: Product Load (3-stage calculation)
  const calculateProductLoad = () => {
    const mass = capacityRequired;
    const { specificHeatAbove, specificHeatBelow, latentHeat, freezingPoint } = product;
    
    let sensibleAbove = 0;
    let latentLoad = 0;
    let sensibleBelow = 0;
    
    // Stage 1: Sensible heat above freezing
    if (incomingTemp > freezingPoint) {
      sensibleAbove = (mass * specificHeatAbove * (incomingTemp - freezingPoint)) / BLAST_FREEZER_CONSTANTS.kjToTR;
    }
    
    // Stage 2: Latent heat (freezing process)
    if (outgoingTemp < freezingPoint && incomingTemp > freezingPoint) {
      latentLoad = (mass * latentHeat) / BLAST_FREEZER_CONSTANTS.kjToTR;
    }
    
    // Stage 3: Sensible heat below freezing
    if (outgoingTemp < freezingPoint) {
      const startTemp = Math.max(incomingTemp, freezingPoint);
      sensibleBelow = (mass * specificHeatBelow * (startTemp - outgoingTemp)) / BLAST_FREEZER_CONSTANTS.kjToTR;
    }
    
    return {
      sensibleAbove,
      latent: latentLoad,
      sensibleBelow,
      total: sensibleAbove + latentLoad + sensibleBelow,
      // For detailed display (kJ)
      sensibleAboveKJ: mass * specificHeatAbove * (incomingTemp - freezingPoint),
      latentKJ: mass * latentHeat,
      sensibleBelowKJ: mass * specificHeatBelow * Math.abs(freezingPoint - outgoingTemp)
    };
  };
  
  // 3. EXACT Excel Formula: Air Change Load
  const calculateAirChangeLoad = () => {
    const roomVolume = volume;
    const airChangeRate = BLAST_FREEZER_CONSTANTS.airChangeRate;
    const enthalpyDiff = BLAST_FREEZER_CONSTANTS.airEnthalpyDiff;
    const hours = batchHours; // Use batchHours instead of operatingHours as per Excel
    
    // Q = Air changes × Volume × Enthalpy difference × Hours / 3517
    const loadTR = (airChangeRate * roomVolume * enthalpyDiff * hours) / BLAST_FREEZER_CONSTANTS.kjToTR;
    const loadKW = loadTR * 3.517;
    
    return {
      loadTR,
      loadKW,
      airChangeRate,
      enthalpyDiff,
      totalKJDay: airChangeRate * roomVolume * enthalpyDiff * hours
    };
  };
  
  // 4. EXACT Excel Formula: Internal Load Calculations
  const calculateInternalLoads = () => {
    const occupancyLoad = (numberOfPeople * BLAST_FREEZER_CONSTANTS.personHeatLoad * workingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    const lightingLoad = (lightLoad * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    const equipmentLoad = (fanMotorRating * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    
    // Heater loads
    const peripheralHeaterLoad = (peripheralHeatersQty * peripheralHeatersCapacity * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    const doorHeaterLoad = (doorHeatersQty * doorHeatersCapacity * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    const trayHeaterLoad = (trayHeatersQty * trayHeatersCapacity * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    const drainHeaterLoad = (drainHeatersQty * drainHeatersCapacity * 1000 * operatingHours) / (BLAST_FREEZER_CONSTANTS.wToTR * 24);
    
    const totalHeaterLoad = peripheralHeaterLoad + doorHeaterLoad + trayHeaterLoad + drainHeaterLoad;
    
    return {
      occupancy: occupancyLoad,
      lighting: lightingLoad,
      equipment: equipmentLoad,
      peripheralHeaters: peripheralHeaterLoad,
      doorHeaters: doorHeaterLoad,
      trayHeaters: trayHeaterLoad,
      drainHeaters: drainHeaterLoad,
      totalHeaters: totalHeaterLoad,
      total: occupancyLoad + lightingLoad + equipmentLoad + totalHeaterLoad,
      // For detailed display (kJ/day)
      occupancyKJDay: (numberOfPeople * BLAST_FREEZER_CONSTANTS.personHeatLoad * workingHours) / 1000,
      lightingKJDay: (lightLoad * 1000 * operatingHours) / 1000,
      equipmentKJDay: (fanMotorRating * 1000 * operatingHours) / 1000,
      peripheralHeatersKJDay: (peripheralHeatersQty * peripheralHeatersCapacity * 1000 * operatingHours) / 1000,
      doorHeatersKJDay: (doorHeatersQty * doorHeatersCapacity * 1000 * operatingHours) / 1000,
      trayHeatersKJDay: (trayHeatersQty * trayHeatersCapacity * 1000 * operatingHours) / 1000,
      drainHeatersKJDay: (drainHeatersQty * drainHeatersCapacity * 1000 * operatingHours) / 1000
    };
  };
  
  // Calculate all loads
  const transmissionLoad = calculateTransmissionLoad();
  const productLoad = calculateProductLoad();
  const airLoad = calculateAirChangeLoad();
  const internalLoads = calculateInternalLoads();
  
  // Calculate additional engineering outputs
  const loadKJPerBatch = (transmissionLoad.totalTR + productLoad.total + airLoad.loadTR + internalLoads.total) * 3517 * batchHours;
  const loadKW = (transmissionLoad.totalTR + productLoad.total + airLoad.loadTR + internalLoads.total) * 3.517;
  
  // 24-Hour Heat Loads
  const sensibleHeatKJ24Hr = (productLoad.sensibleAbove + productLoad.sensibleBelow) * 3517 * (24 / batchHours);
  const latentHeatKJ24Hr = productLoad.latent * 3517 * (24 / batchHours);
  
  // SHR Calculation
  const totalSensibleLoad = transmissionLoad.totalTR + productLoad.sensibleAbove + productLoad.sensibleBelow + internalLoads.total;
  const totalLatentLoad = productLoad.latent;
  const totalLoadForSHR = totalSensibleLoad + totalLatentLoad;
  const SHR = totalLoadForSHR > 0 ? totalSensibleLoad / totalLoadForSHR : 1.0;
  
  // Air Quantity Required (CFM)
  const airQtyRequiredCfm = (totalLoadTR * 3517 * 1000) / (1.2 * 1005 * Math.abs(temperatureDifference));
  
  // 5. Total Load Calculation (Excel Method)
  const totalLoadTR = transmissionLoad.totalTR + productLoad.total + airLoad.loadTR + internalLoads.total;
  const totalLoadKW = totalLoadTR * 3.517;
  
  // 6. Apply Safety Factor
  const safetyFactor = BLAST_FREEZER_CONSTANTS.safetyFactor;
  const finalLoadTR = totalLoadTR * safetyFactor;
  const finalLoadKW = finalLoadTR * 3.517;
  const safetyFactorLoadTR = finalLoadTR - totalLoadTR;
  
  // Conversions
  const totalBTU = finalLoadKW * 3412; // kW to BTU/hr
  
  // Daily energy consumption
  const dailyEnergyConsumption = finalLoadKW * 24; // kWh/day
  
  return {
    dimensions: { length, breadth, height },
    doorDimensions: { width: doorWidth, height: doorHeight },
    areas: {
      wall: wallArea,
      ceiling: ceilingArea,
      floor: floorArea,
      door: doorArea
    },
    volume,
    storageCapacity: {
      maximum: maximumStorage,
      utilization: storageUtilization,
      density: storageCapacity
    },
    temperatureDifference,
    batchHours,
    construction: {
      type: insulationType,
      wallThickness,
      ceilingThickness,
      floorThickness,
      internalFloorThickness,
      uFactors: {
        walls: wallUFactor,
        ceiling: ceilingUFactor,
        floor: floorUFactor
      }
    },
    productInfo: {
      type: productData.productType,
      mass: capacityRequired,
      incomingTemp,
      outgoingTemp,
      properties: product
    },
    conditions: {
      ambientTemp,
      roomTemp,
      operatingHours,
      airChangeRate: BLAST_FREEZER_CONSTANTS.airChangeRate,
      doorClearOpening,
      airFlowPerFan
    },
    breakdown: {
      transmission: transmissionLoad,
      product: productLoad,
      airChange: airLoad,
      internal: internalLoads
    },
    // Load summary
    loadSummary: {
      totalCalculatedTR: totalLoadTR,
      totalCalculatedKW: totalLoadKW,
      safetyFactorTR: safetyFactorLoadTR,
      safetyFactorKW: safetyFactorLoadTR * 3.517,
      finalLoadTR: finalLoadTR,
      finalLoadKW: finalLoadKW,
      safetyPercentage: ((safetyFactor - 1) * 100)
    },
    // Conversions
    totalTR: finalLoadTR,
    totalKW: finalLoadKW,
    totalBTU: totalBTU,
    dailyEnergyConsumption,
    
    // Engineering outputs
    engineeringOutputs: {
      loadKJPerBatch: loadKJPerBatch,
      loadKW: loadKW,
      sensibleHeatKJ24Hr: sensibleHeatKJ24Hr,
      latentHeatKJ24Hr: latentHeatKJ24Hr,
      SHR: SHR,
      airQtyRequiredCfm: airQtyRequiredCfm
    },
    
    // Thermal properties
    thermalProperties: {
      wallUFactor: wallUFactor,
      ceilingUFactor: ceilingUFactor,
      floorUFactor: floorUFactor,
      insulationEfficiency: `${insulationType} - ${BLAST_FREEZER_CONSTANTS.insulationThermalConductivity[insulationType as keyof typeof BLAST_FREEZER_CONSTANTS.insulationThermalConductivity]} W/mK`
    },
    
    // Equipment summary
    equipmentSummary: {
      totalFanLoad: fanMotorRating,
      totalHeaterLoad: (peripheralHeatersQty * peripheralHeatersCapacity) + 
                      (doorHeatersQty * doorHeatersCapacity) + 
                      (trayHeatersQty * trayHeatersCapacity) + 
                      (drainHeatersQty * drainHeatersCapacity),
      totalLightingLoad: lightLoad,
      totalPeopleLoad: (numberOfPeople * BLAST_FREEZER_CONSTANTS.personHeatLoad * workingHours) / (1000 * 24)
    }
  };
}