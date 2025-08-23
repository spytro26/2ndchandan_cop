// Cold Room specific constants and data - UPDATED TO MATCH EXCEL EXACTLY
export const COLD_ROOM_DEFAULTS = {
  // Room specs - Updated to Excel values
  length: 3.05,
  width: 4.5, 
  height: 3.0,
  doorWidth: 1.2,
  doorHeight: 2.1,
  
  // Operating conditions - UPDATED TO EXCEL VALUES
  externalTemp: 45,        // °C (Excel shows 45, not 35)
  internalTemp: 2,         // °C (Excel shows 2, not 4)
  operatingHours: 20,      // hours/day (Excel shows 20)
  pullDownTime: 24,        // hours (Excel shows 24, not 6-8)
  
  // NEW MISSING INPUTS
  doorClearOpening: 2000,  // mm (Excel shows 2000mm)
  storageDensity: 8,       // kg/m³ (Excel shows 8 kg/m³)
  airFlowPerFan: 4163,     // Cfm (Excel shows 4163)
  
  // Construction - Updated
  insulationType: "PUF",
  insulationThickness: 100,
  internalFloorThickness: 100,  // mm (Excel shows 100mm floor)
  numberOfHeaters: 1,           // Count (for heater calculations)
  numberOfDoors: 1,             // Count (Excel references this)
  
  // Product & load - UPDATED TO EXCEL VALUES
  productType: "BANANA",        // Excel shows BANANA, not "General Food"
  dailyProductLoad: 4000,       // kg (Excel shows 4000, not 2000-3000)
  productIncomingTemp: 30,      // °C (Excel shows 30, not 25)
  productOutgoingTemp: 2,       // °C (Match internal temp from Excel)
  specificHeatAbove: 4.1,       // kJ/kg·K (Excel shows 4.1 for banana)
  respirationRate: 50,          // W/tonne (Excel shows 50 constant)
  storageType: "Palletized",
  
  // Usage - Updated to Excel values
  numberOfPeople: 1,
  hoursWorking: 20,        // Match operating hours
  dailyDoorOpenings: 30,
  lightingWattage: 70,     // W (Excel shows 0.07 kW = 70W)
  equipmentLoad: 250       // W (Excel shows 0.25 kW = 250W)
};

// EXCEL EXACT CONSTANTS
export const COLD_ROOM_EXCEL_CONSTANTS = {
  // TRANSMISSION - Excel exact U-factors
  uFactorWall: 0.295,           // W/m²·K (Excel exact)
  uFactorCeiling: 0.295,        // W/m²·K  
  uFactorFloor: 0.295,          // W/m²·K
  
  // PRODUCT  
  bananaSpecificHeat: 4.1,      // kJ/kg·K (Excel shows for banana)
  respirationRate: 50,          // W/tonne (Excel constant)
  
  // AIR CHANGE
  airFlowRate: 3.4,             // L/S (Excel shows this)
  enthalpyDiff: 0.10,           // kJ/kg (Excel shows this)
  
  // LOADS - Excel exact values
  equipmentLoad: 0.25,          // kW (Excel shows 0.25, not 0.5-0.75)
  occupancyLoad: 1.0,           // kW per person (Excel shows 1.0)
  lightingLoad: 0.07,           // kW (Excel shows 0.07)
  doorHeaterCapacity: 0.145,    // kW (Excel exact value)
  
  // DEFAULTS FROM EXCEL
  defaultExternalTemp: 45,      // °C (Excel shows 45)  
  defaultInternalTemp: 2,       // °C (Excel shows 2)
  defaultOperatingHours: 20,    // hours (Excel shows 20)
  defaultPullDownTime: 24,      // hours (Excel shows 24)
  defaultProductLoad: 4000,     // kg (Excel shows 4000)
  defaultStorageDensity: 8,     // kg/m³ (Excel shows 8)
  
  // Conversion factors
  safetyFactor: 1.1,           // 10%
  kwToTR: 3.517,               // kW to TR conversion
  kwToBTU: 3412,               // kW to BTU/hr conversion
  kwToKJDay: 86.4              // kW to kJ/day (24 * 3.6)
};

// Enhanced product database with BANANA - EXACT EXCEL VALUES
export const COLD_ROOM_PRODUCTS = {
  "BANANA": { 
    specificHeatAbove: 4.1,      // kJ/kg·K (Excel exact)
    specificHeatBelow: 2.1,      // kJ/kg·K
    latentHeat: 0,               // kJ/kg (no freezing in cold room)
    freezingPoint: -0.8,         // °C
    density: 600,                // kg/m³
    storageEfficiency: 0.65,
    respirationRate: 50          // W/tonne (Excel constant)
  },
  "Vegetables (Mixed)": {
    specificHeatAbove: 3.7, 
    specificHeatBelow: 1.9, 
    latentHeat: 0,
    freezingPoint: -1.0, 
    density: 600, 
    storageEfficiency: 0.55,
    respirationRate: 24
  },
  "Fruits (Mixed)": {
    specificHeatAbove: 3.6, 
    specificHeatBelow: 1.9, 
    latentHeat: 0,
    freezingPoint: -1.2, 
    density: 650, 
    storageEfficiency: 0.50,
    respirationRate: 28
  },
  "Beverages": {
    specificHeatAbove: 4.0, 
    specificHeatBelow: 2.0, 
    latentHeat: 0,
    freezingPoint: -2.0, 
    density: 1000, 
    storageEfficiency: 0.80,
    respirationRate: 0
  },
  "Dairy Products": {
    specificHeatAbove: 3.4, 
    specificHeatBelow: 1.8, 
    latentHeat: 0,
    freezingPoint: -1.5, 
    density: 1020, 
    storageEfficiency: 0.75,
    respirationRate: 0
  },
  "Pharmaceutical": {
    specificHeatAbove: 3.2, 
    specificHeatBelow: 1.7, 
    latentHeat: 0,
    freezingPoint: -2.0, 
    density: 800, 
    storageEfficiency: 0.70,
    respirationRate: 0
  },
  "General Food Items": {
    specificHeatAbove: 3.0, 
    specificHeatBelow: 1.6, 
    latentHeat: 0,
    freezingPoint: -2.0, 
    density: 800, 
    storageEfficiency: 0.65,
    respirationRate: 0
  }
};