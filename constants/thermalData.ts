export const THERMAL_DATA = {
  // U-factors (W/m²K) based on insulation type and thickness
  uFactors: {
    PUF: {
      75: 0.32, 
      100: 0.25, 
      125: 0.20, 
      150: 0.17, 
      200: 0.13
    },
    EPS: {
      75: 0.45, 
      100: 0.35, 
      125: 0.28, 
      150: 0.23, 
      200: 0.18
    },
    Rockwool: {
      75: 0.50, 
      100: 0.38, 
      125: 0.30, 
      150: 0.25, 
      200: 0.20
    }
  },
  
  // Standard thermal constants
  airDensity: 1.2, // kg/m³
  airSpecificHeat: 1.006, // kJ/kg·K  
  personHeatLoad: 0.407, // kW per person
  
  // Air change rates for different applications
  airChangeRates: {
    freezer: 0.5, // changes per hour
    blastFreezer: 1.0,
    coldRoom: 0.3
  },
  
  safetyFactor: 1.1, // 10% safety margin
  
  // Cold room specific constants
  coldRoom: {
    defaultInternalTemp: 4,     // °C
    defaultExternalTemp: 35,    // °C
    defaultPullDownTime: 6,     // hours
    temperatureRange: {
      min: -5,                  // °C
      max: 15                   // °C
    }
  }
};