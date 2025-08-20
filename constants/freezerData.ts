// Freezer specific constants and enhanced data
export const FREEZER_DEFAULTS = {
  // Room specs
  length: 4.0,
  width: 3.0, 
  height: 2.5,
  doorWidth: 1.0,
  doorHeight: 2.0,
  
  // Operating conditions
  externalTemp: 35,
  internalTemp: -18,
  operatingHours: 24,
  pullDownTime: 10,
  roomHumidity: 85, // %RH - critical for SHR
  steamHumidifierLoad: 0, // kW
  
  // Construction
  insulationType: "PUF",
  insulationThickness: 150,
  internalFloorThickness: 150, // mm
  numberOfFloors: 1,
  
  // Product & load
  productType: "General Food Items", // Changed from Beef
  dailyProductLoad: 1000,
  productIncomingTemp: 25,
  productOutgoingTemp: -18,
  storageType: "Boxed", // Default storage type
  
  // Equipment details
  fanMotorRating: 0.37, // kW
  numberOfFans: 6,
  fanOperatingHours: 24,
  fanAirFlowRate: '2000', // CFM per fan
  doorHeatersLoad: 0.24, // kW
  trayHeatersLoad: 2.0, // kW
  peripheralHeatersLoad: 0, // kW
  
  // Usage
  numberOfPeople: 2,
  hoursWorking: 16, // Updated from 4 to 16 hours
  dailyDoorOpenings: 15,
  lightingWattage: 150,
  equipmentLoad: 300
};

// Enhanced thermal constants for Excel precision
export const ENHANCED_CONSTANTS = {
  // Air properties
  airDensity: 1.2, // kg/m³
  airSpecificHeat: 1.006, // kJ/kg·K
  enthalpyDiff: 0.1203, // kJ/L for air change calculations (CRITICAL)
  
  // Equipment defaults
  fanMotorRating: 0.37, // kW
  fanQuantity: 6,
  defaultFanAirFlow: 2000, // CFM per fan
  doorHeaterLoad: 0.24, // kW for doors > 1.8m²
  doorHeaterThreshold: 1.8, // m² - doors larger than this need heaters
  doorInfiltrationFactor: 1800, // Infiltration calculation factor
  
  // Humidity constants
  defaultHumidity: 85, // %RH
  steamGeneratorCapacity: 0.407, // kW per unit
  
  // Air change rates by room type
  airChangeRates: {
    freezer: 0.5,
    blastFreezer: 1.0,
    coldRoom: 0.3
  },
  
  // Heater capacities
  peripheralHeaterCapacity: 100, // W/m²
  defaultTrayHeatersLoad: 2.0, // kW
  defaultDoorHeatersLoad: 0.24, // kW
  
  // Updated occupancy hours
  defaultOccupancyHours: 16, // Update from 4 to match Excel
  
  // Safety factor
  safetyFactor: 1.1 // 10%
};