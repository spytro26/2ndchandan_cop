// Blast Freezer specific constants and enhanced data
export const BLAST_FREEZER_DEFAULTS = {
  // Room specs (larger than standard freezer)
  length: 5.0,
  breadth: 5.0, 
  height: 3.5,
  doorWidth: 2.1,
  doorHeight: 2.1,
  
  // Operating conditions (more extreme)
  ambientTemp: 43,
  roomTemp: -35,
  batchHours: 8,
  operatingHours: 24,
  
  // Construction (thicker insulation)
  insulationType: "PUF",
  wallThickness: 150,
  ceilingThickness: 150,
  floorThickness: 150,
  internalFloorThickness: 150,
  
  // Product & load (higher capacity)
  productType: "Chicken",
  capacityRequired: 2000,
  incomingTemp: -5,
  outgoingTemp: -30,
  storageCapacity: 4, // kg/m³
  
  // Usage & equipment
  numberOfPeople: 2,
  workingHours: 4,
  lightLoad: 0.1, // kW
  fanMotorRating: 0.37,
  
  // Heater specifications
  peripheralHeatersQty: 1,
  peripheralHeatersCapacity: 1.5,
  doorHeatersQty: 1,
  doorHeatersCapacity: 0.27,
  trayHeatersQty: 1,
  trayHeatersCapacity: 2.2,
  drainHeatersQty: 1,
  drainHeatersCapacity: 0.04
};

// Blast freezer specific thermal constants
export const BLAST_FREEZER_CONSTANTS = {
  // Dynamic U-factor calculation based on insulation thermal conductivity
  insulationThermalConductivity: {
    'PUF': 0.023,      // W/mK
    'EPS': 0.036,      // W/mK  
    'Rockwool': 0.040  // W/mK
  },
  
  // Air change parameters (higher than standard freezer)
  airChangeRate: 4.2, // changes per hour
  airEnthalpyDiff: 0.14, // kJ/kg
  
  // Heat load constants
  personHeatLoad: 1800, // W per person (higher for blast freezer work)
  lightHeatFactor: 1.0, // multiplier for lighting
  safetyFactor: 1.05, // 5% safety margin
  
  // Conversion factors
  kjToTR: 3517, // kJ/hr to TR conversion
  wToTR: 3517, // W to TR conversion
  kjToKW: 3600, // kJ/hr to kW conversion
  
  // Air properties
  airDensity: 1.2, // kg/m³
  airSpecificHeat: 1.006, // kJ/kg·K
  
  // Equipment defaults
  defaultFanMotorRating: 0.37, // kW
  defaultLightLoad: 0.1, // kW
  
  // Heater defaults
  defaultPeripheralHeaterCapacity: 1.5, // kW
  defaultDoorHeaterCapacity: 0.27, // kW
  defaultTrayHeaterCapacity: 2.2, // kW
  defaultDrainHeaterCapacity: 0.04 // kW
};

// Dynamic U-factor calculation function
export const calculateUFactor = (insulationType: string, thickness: number): number => {
  const k = BLAST_FREEZER_CONSTANTS.insulationThermalConductivity[insulationType as keyof typeof BLAST_FREEZER_CONSTANTS.insulationThermalConductivity];
  if (!k) return 0.153; // fallback to original fixed value
  return k / (thickness / 1000); // Convert thickness from mm to meters
};

// Enhanced product database for blast freezer applications
export const BLAST_FREEZER_PRODUCTS = {
  "Chicken": { 
    specificHeatAbove: 3.49, // kJ/kg·K
    specificHeatBelow: 2.14, // kJ/kg·K
    latentHeat: 233, // kJ/kg
    freezingPoint: -1.7, // °C
    density: 950, // kg/m³
    storageEfficiency: 0.60 
  },
  "Beef": { 
    specificHeatAbove: 3.2, 
    specificHeatBelow: 1.7, 
    latentHeat: 233, 
    freezingPoint: -1.8, 
    density: 1050, 
    storageEfficiency: 0.65 
  },
  "Pork": { 
    specificHeatAbove: 2.9, 
    specificHeatBelow: 1.6, 
    latentHeat: 214, 
    freezingPoint: -2.2, 
    density: 1000, 
    storageEfficiency: 0.65 
  },
  "Fish": { 
    specificHeatAbove: 3.6, 
    specificHeatBelow: 1.9, 
    latentHeat: 235, 
    freezingPoint: -2.0, 
    density: 800, 
    storageEfficiency: 0.55 
  },
  "Ice Cream": { 
    specificHeatAbove: 3.5, 
    specificHeatBelow: 2.0, 
    latentHeat: 250, 
    freezingPoint: -5.6, 
    density: 550, 
    storageEfficiency: 0.60 
  },
  "General Food Items": { 
    specificHeatAbove: 3.0, 
    specificHeatBelow: 1.6, 
    latentHeat: 200, 
    freezingPoint: -2.0, 
    density: 800, 
    storageEfficiency: 0.65 
  }
};