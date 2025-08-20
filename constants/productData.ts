export const PRODUCTS = {
  // Meat & Poultry (kJ/kg·K for specific heat, kJ/kg for latent heat, kg/m³ for density)
  "Beef": { 
    specificHeatAbove: 3.2, specificHeatBelow: 1.7, latentHeat: 233, 
    freezingPoint: -1.8, density: 1050, storageEfficiency: 0.65 
  },
  "Chicken": { 
    specificHeatAbove: 3.3, specificHeatBelow: 1.8, latentHeat: 247, 
    freezingPoint: -2.8, density: 950, storageEfficiency: 0.60 
  },
  "Pork": { 
    specificHeatAbove: 2.9, specificHeatBelow: 1.6, latentHeat: 214, 
    freezingPoint: -2.2, density: 1000, storageEfficiency: 0.65 
  },
  "Fish": { 
    specificHeatAbove: 3.6, specificHeatBelow: 1.9, latentHeat: 235, 
    freezingPoint: -2.0, density: 800, storageEfficiency: 0.55 
  },
  
  // Dairy Products
  "Milk": { 
    specificHeatAbove: 3.9, specificHeatBelow: 2.1, latentHeat: 270, 
    freezingPoint: -0.54, density: 1030, storageEfficiency: 0.80 
  },
  "Cheese": { 
    specificHeatAbove: 2.8, specificHeatBelow: 1.4, latentHeat: 120, 
    freezingPoint: -13.0, density: 1100, storageEfficiency: 0.70 
  },
  "Ice Cream": { 
    specificHeatAbove: 3.5, specificHeatBelow: 2.0, latentHeat: 250, 
    freezingPoint: -5.6, density: 550, storageEfficiency: 0.60 
  },
  
  // Fruits & Vegetables
  "Apples": { 
    specificHeatAbove: 3.8, specificHeatBelow: 1.9, latentHeat: 281, 
    freezingPoint: -1.1, density: 700, storageEfficiency: 0.50 
  },
  "Potatoes": { 
    specificHeatAbove: 3.4, specificHeatBelow: 1.8, latentHeat: 267, 
    freezingPoint: -0.6, density: 650, storageEfficiency: 0.55 
  },
  "Carrots": { 
    specificHeatAbove: 3.6, specificHeatBelow: 1.9, latentHeat: 290, 
    freezingPoint: -1.4, density: 600, storageEfficiency: 0.50 
  },
  "Tomatoes": { 
    specificHeatAbove: 4.0, specificHeatBelow: 2.0, latentHeat: 316, 
    freezingPoint: -0.5, density: 550, storageEfficiency: 0.45 
  },
  
  // Processed Foods
  "General Food Items": { 
    specificHeatAbove: 3.0, specificHeatBelow: 1.6, latentHeat: 200, 
    freezingPoint: -2.0, density: 800, storageEfficiency: 0.65 
  },
  
  // Cold Room Specific Products
  "Vegetables (Mixed)": {
    specificHeatAbove: 3.7, specificHeatBelow: 1.9, latentHeat: 285,
    freezingPoint: -1.0, density: 600, storageEfficiency: 0.55
  },
  "Fruits (Mixed)": {
    specificHeatAbove: 3.6, specificHeatBelow: 1.9, latentHeat: 280,
    freezingPoint: -1.2, density: 650, storageEfficiency: 0.50
  },
  "Beverages": {
    specificHeatAbove: 4.0, specificHeatBelow: 2.0, latentHeat: 330,
    freezingPoint: -2.0, density: 1000, storageEfficiency: 0.80
  },
  "Dairy Products": {
    specificHeatAbove: 3.4, specificHeatBelow: 1.8, latentHeat: 250,
    freezingPoint: -1.5, density: 1020, storageEfficiency: 0.75
  },
  "Pharmaceutical": {
    specificHeatAbove: 3.2, specificHeatBelow: 1.7, latentHeat: 200,
    freezingPoint: -2.0, density: 800, storageEfficiency: 0.70
  }
};

// Storage efficiency factors by packaging type
export const STORAGE_FACTORS = {
  "Loose": 0.45,      // Loose products  
  "Boxed": 0.65,      // Boxed/crated products  
  "Palletized": 0.75, // Palletized storage
  "Bulk": 0.50,       // Bulk storage
  "Racked": 0.70      // Racked storage
};