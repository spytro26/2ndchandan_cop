import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateEnhancedFreezerLoad } from '@/utils/enhancedFreezerCalculations';

// Try to import expo-print and expo-sharing, but don't fail if they're not available
let Print: any = null;
let Sharing: any = null;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch (error) {
  console.log('PDF packages not available, will use text sharing fallback');
}

export default function ResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generateHTMLReport = () => {
    if (!results) return '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Freezer Cooling Load Report</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                line-height: 1.4; 
                color: #333;
            }
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #3B82F6; 
                padding-bottom: 20px;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #1E3A8A;
                margin-bottom: 5px;
                letter-spacing: 2px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .powered-by {
                font-size: 16px;
                color: #3B82F6;
                margin-bottom: 15px;
                font-weight: 600;
            }
            .title { 
                font-size: 24px; 
                font-weight: bold; 
                color: #1E3A8A; 
                margin: 10px 0;
            }
            .main-result { 
                background: linear-gradient(135deg, #1E3A8A, #3B82F6); 
                color: white; 
                padding: 20px; 
                border-radius: 10px; 
                text-align: center; 
                margin: 20px 0;
            }
            .main-value { 
                font-size: 32px; 
                font-weight: bold; 
                margin: 10px 0;
            }
            .section { 
                margin: 20px 0; 
                page-break-inside: avoid;
            }
            .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #1E3A8A; 
                border-bottom: 1px solid #E5E7EB; 
                padding-bottom: 5px; 
                margin-bottom: 15px;
            }
            .subsection {
                margin-bottom: 20px;
            }
            .subsection-title {
                font-size: 16px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
                padding-left: 10px;
                border-left: 3px solid #3B82F6;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0;
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
                border: 1px solid #E5E7EB; 
                padding: 8px; 
                text-align: center; 
                font-size: 12px;
            }
            th { 
                background: #F8FAFC; 
                font-weight: bold; 
                color: #1E3A8A;
            }
            .total-row { 
                background: #EBF8FF; 
                font-weight: bold;
            }
            .final-row { 
                background: #3B82F6; 
                color: white; 
                font-weight: bold;
            }
            .info-box { 
                background: #F8FAFC; 
                border-left: 4px solid #3B82F6; 
                padding: 15px; 
                margin: 10px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">ENZO ENGINEERING SOLUTIONS</div>
            <div class="powered-by">⚡ Powered by Enzo CoolCalc</div>
            <div class="title">🌡️ FREEZER COOLING LOAD CALCULATION REPORT</div>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="main-result">
            <div class="main-value">${results.loadSummary.finalLoad.toFixed(2)} kW</div>
            <div>Required Cooling Capacity</div>
            <div style="margin-top: 10px;">
                <div>Refrigeration: ${results.totalTR.toFixed(2)} TR</div>
                <div>Daily Energy: ${(results.loadSummary.finalLoad * 24).toFixed(1)} kWh</div>
                <div>Heat Removal: ${results.totalBTU.toFixed(0)} BTU/hr</div>
                <div>SHR: ${results.loadSummary.SHR.toFixed(3)}</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">� INPUT PARAMETERS</div>
            
            <div class="subsection">
                <div class="subsection-title">🏗️ Room Construction</div>
                <div class="info-box">
                    <div><strong>Room Dimensions:</strong></div>
                    <div>• Length: ${results.dimensions.length} m</div>
                    <div>• Width: ${results.dimensions.width} m</div>
                    <div>• Height: ${results.dimensions.height} m</div>
                    <div>• Total Volume: ${results.volume.toFixed(1)} m³</div>
                </div>
                <div class="info-box">
                    <div><strong>Door Specifications:</strong></div>
                    <div>• Door Width: ${results.doorDimensions.width} m</div>
                    <div>• Door Height: ${results.doorDimensions.height} m</div>
                    <div>• Door Openings per Day: ${results.roomData?.doorOpenings || 'N/A'}</div>
                </div>
                <div class="info-box">
                    <div><strong>Insulation Details:</strong></div>
                    <div>• Insulation Type: ${results.construction?.type || 'PUF'}</div>
                    <div>• Wall Thickness: ${results.construction?.thickness || 150} mm</div>
                    <div>• Floor Thickness: ${results.roomData?.internalFloorThickness || 150} mm</div>
                    <div>• Number of Floors: ${results.roomData?.numberOfFloors || 1}</div>
                    <div>• U-Factor: ${(results.construction?.uFactor || 0.17).toFixed(3)} W/m²K</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🌡️ Operating Conditions</div>
                <div class="info-box">
                    <div><strong>Temperature Settings:</strong></div>
                    <div>• External Temperature: ${results.conditions?.externalTemp || 35}°C</div>
                    <div>• Internal Temperature: ${results.conditions?.internalTemp || -18}°C</div>
                    <div>• Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C</div>
                </div>
                <div class="info-box">
                    <div><strong>Operating Parameters:</strong></div>
                    <div>• Operating Hours: ${results.conditions?.operatingHours || 24} hours/day</div>
                    <div>• Pull Down Time: ${results.conditions?.pullDownTime || 10} hours</div>
                    <div>• Room Humidity: ${results.conditions?.roomHumidity || 85}%</div>
                    <div>• Air Flow per Fan: ${results.conditions?.airFlowPerFan || 2000} CFM</div>
                    <div>• Steam Humidifier Load: ${results.conditions?.steamHumidifierLoad || 0} kW</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🥩 Product Information</div>
                <div class="info-box">
                    <div><strong>Product Details:</strong></div>
                    <div>• Product Type: ${results.productData?.productType || 'General Food Items'}</div>
                    <div>• Daily Load: ${results.productData?.dailyLoad || 1000} kg/day</div>
                    <div>• Incoming Temperature: ${results.productData?.incomingTemp || 25}°C</div>
                    <div>• Outgoing Temperature: ${results.productData?.outgoingTemp || -18}°C</div>
                    <div>• Storage Type: ${results.productData?.storageType || 'Boxed'}</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">👥 Personnel & Equipment</div>
                <div class="info-box">
                    <div><strong>Personnel:</strong></div>
                    <div>• Number of People: ${results.productData?.numberOfPeople || 2}</div>
                    <div>• Working Hours: ${results.productData?.workingHours || 4} hours/day</div>
                </div>
                <div class="info-box">
                    <div><strong>Electrical Equipment:</strong></div>
                    <div>• Lighting Wattage: ${results.productData?.lightingWattage || 150} W</div>
                    <div>• Equipment Load: ${results.productData?.equipmentLoad || 300} W</div>
                    <div>• Fan Motor Rating: ${results.productData?.fanMotorRating || 0.37} kW</div>
                    <div>• Number of Fans: ${results.productData?.numberOfFans || 6}</div>
                    <div>• Fan Operating Hours: ${results.productData?.fanOperatingHours || 24} hours/day</div>
                </div>
                <div class="info-box">
                    <div><strong>Heaters:</strong></div>
                    <div>• Door Heaters Load: ${results.productData?.doorHeatersLoad || 0.24} kW</div>
                    <div>• Tray Heaters Load: ${results.productData?.trayHeatersLoad || 2.0} kW</div>
                    <div>• Peripheral Heaters Load: ${results.productData?.peripheralHeatersLoad || 0} kW</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📏 CALCULATED AREAS & FACTORS</div>
            <div class="info-box">
                <div><strong>Surface Areas:</strong></div>
                <div>• Wall Area: ${results.areas.wall.toFixed(1)} m²</div>
                <div>• Ceiling Area: ${results.areas.ceiling.toFixed(1)} m²</div>
                <div>• Floor Area: ${results.areas.floor.toFixed(1)} m²</div>
                <div>• Door Clear Opening: ${results.breakdown.doorOpening.doorClearOpening.toFixed(2)} m²</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📊 TRANSMISSION LOADS</div>
            <table>
                <tr>
                    <th>Surface</th>
                    <th>Area (m²)</th>
                    <th>U-factor</th>
                    <th>ΔT (°C)</th>
                    <th>Load (kJ/day)</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Walls</td>
                    <td>${results.areas.wall.toFixed(1)}</td>
                    <td>${results.construction.uFactor.toFixed(2)}</td>
                    <td>${results.temperatureDifference.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.wallsKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.walls.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Ceiling</td>
                    <td>${results.areas.ceiling.toFixed(1)}</td>
                    <td>${results.construction.uFactor.toFixed(2)}</td>
                    <td>${results.temperatureDifference.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.ceilingKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.ceiling.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Floor</td>
                    <td>${results.areas.floor.toFixed(1)}</td>
                    <td>${results.construction.uFactor.toFixed(2)}</td>
                    <td>${results.temperatureDifference.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.floorKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.transmission.floor.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL TRANSMISSION</strong></td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td><strong>${(results.breakdown.transmission.wallsKJDay + results.breakdown.transmission.ceilingKJDay + results.breakdown.transmission.floorKJDay).toFixed(0)}</strong></td>
                    <td><strong>${results.breakdown.transmission.total.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">🥩 PRODUCT LOADS</div>
            <table>
                <tr>
                    <th>Load Component</th>
                    <th>Load (kJ/day)</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Sensible Heat (Above Freezing)</td>
                    <td>${results.breakdown.product.sensibleAboveKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.product.sensibleAbove.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Latent Heat (Freezing)</td>
                    <td>${results.breakdown.product.latentKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.product.latent.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Sensible Heat (Below Freezing)</td>
                    <td>${results.breakdown.product.sensibleBelowKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.product.sensibleBelow.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL PRODUCT LOAD</strong></td>
                    <td><strong>${(results.breakdown.product.sensibleAboveKJDay + results.breakdown.product.latentKJDay + results.breakdown.product.sensibleBelowKJDay).toFixed(0)}</strong></td>
                    <td><strong>${results.breakdown.product.total.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">💨 AIR CHANGE & INFILTRATION</div>
            <table>
                <tr>
                    <th>Component</th>
                    <th>Value</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Air flow rate</td>
                    <td>${results.breakdown.airChange.airFlowLperS.toFixed(1)} L/S</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Enthalpy difference</td>
                    <td>${results.breakdown.airChange.enthalpyDiff} kJ/L</td>
                    <td>-</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Air infiltration load</strong></td>
                    <td><strong>${results.breakdown.airChange.airFlowKJDay.toFixed(0)} kJ/day</strong></td>
                    <td><strong>${results.breakdown.airChange.load.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">🚪 DOOR OPENING LOADS</div>
            <table>
                <tr>
                    <th>Component</th>
                    <th>Load (kJ/day)</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Door Infiltration</td>
                    <td>${results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.doorOpening.infiltration.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Door Heaters</td>
                    <td>-</td>
                    <td>${results.breakdown.doorOpening.heaters.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL DOOR LOAD</strong></td>
                    <td><strong>${results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</strong></td>
                    <td><strong>${results.breakdown.doorOpening.total.toFixed(2)}</strong></td>
                </tr>
            </table>
            <div class="info-box">
                <div>• Door clear opening: ${results.breakdown.doorOpening.doorClearOpening.toFixed(2)} m²</div>
                <div>• Door heaters: ${results.breakdown.doorOpening.doorClearOpening > 1.8 ? 'Required' : 'Not required'} (threshold: 1.8 m²)</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">⚡ INTERNAL LOADS</div>
            <table>
                <tr>
                    <th>Load Component</th>
                    <th>Load (kJ/day)</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Occupancy Load</td>
                    <td>${results.breakdown.internal.occupancyKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.occupancy.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Lighting Load</td>
                    <td>${results.breakdown.internal.lightingKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.lighting.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Fan Motor Load</td>
                    <td>${results.breakdown.internal.fanMotorKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.fanMotor.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Door Heaters</td>
                    <td>${results.breakdown.internal.doorHeatersKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.doorHeaters.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tray Heaters</td>
                    <td>${results.breakdown.internal.trayHeatersKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.trayHeaters.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Steam Humidifiers</td>
                    <td>${results.breakdown.internal.steamHumidifiersKJDay.toFixed(0)}</td>
                    <td>${results.breakdown.internal.steamHumidifiers.toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>TOTAL INTERNAL</strong></td>
                    <td><strong>${(results.breakdown.internal.occupancyKJDay + results.breakdown.internal.lightingKJDay + results.breakdown.internal.fanMotorKJDay + results.breakdown.internal.doorHeatersKJDay + results.breakdown.internal.trayHeatersKJDay + results.breakdown.internal.steamHumidifiersKJDay).toFixed(0)}</strong></td>
                    <td><strong>${results.breakdown.internal.total.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">📈 FINAL SUMMARY</div>
            <table>
                <tr>
                    <th>Load Type</th>
                    <th>Load (kJ/day)</th>
                    <th>Load (kW)</th>
                </tr>
                <tr>
                    <td>Total Sensible Load</td>
                    <td>${(results.loadSummary.totalSensible * 24 * 3600 / 1000).toFixed(0)}</td>
                    <td>${results.loadSummary.totalSensible.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total Latent Load</td>
                    <td>${(results.loadSummary.totalLatent * 24 * 3600 / 1000).toFixed(0)}</td>
                    <td>${results.loadSummary.totalLatent.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>SHR (Sensible Heat Ratio)</td>
                    <td>${results.loadSummary.SHR.toFixed(3)}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Total Load</td>
                    <td>${(results.loadSummary.totalBeforeSafety * 24 * 3600 / 1000).toFixed(0)}</td>
                    <td>${results.loadSummary.totalBeforeSafety.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Safety Factor (10%)</td>
                    <td>${(results.loadSummary.safetyFactor * 24 * 3600 / 1000).toFixed(0)}</td>
                    <td>${results.loadSummary.safetyFactor.toFixed(2)}</td>
                </tr>
                <tr class="final-row">
                    <td><strong>FINAL CAPACITY REQUIRED</strong></td>
                    <td><strong>${(results.loadSummary.finalLoad * 24 * 3600 / 1000).toFixed(0)}</strong></td>
                    <td><strong>${results.loadSummary.finalLoad.toFixed(2)}</strong></td>
                </tr>
            </table>
        </div>

        <div class="section">
            <div class="section-title">📋 ADDITIONAL INFORMATION</div>
            <div class="info-box">
                <div><strong>Required Air Circulation</strong></div>
                <div>• Total Air Flow: ${(parseFloat(results.conditions?.totalAirFlow) || 0).toFixed(0)} CFM</div>
                <div>• Air Flow per Fan: ${(parseFloat(results.conditions?.airFlowPerFan) || 0).toFixed(0)} CFM</div>
                <div>• Number of Fans: ${Math.round(results.breakdown.internal.fanMotor / parseFloat(results.productData?.fanMotorRating || '0.37'))} units</div>
            </div>
            <div class="info-box">
                <div><strong>Storage Capacity</strong></div>
                <div>• Maximum Capacity: ${(parseFloat(results.storageCapacity?.maximum) || 0).toFixed(0)} kg</div>
                <div>• Current Utilization: ${(parseFloat(results.storageCapacity?.utilization) || 0).toFixed(1)}%</div>
                <div>• Storage Type: ${results.storageCapacity?.storageType || 'Boxed'}</div>
            </div>
            <div class="info-box">
                <div><strong>Construction Details</strong></div>
                <div>• Insulation: ${results.construction?.type || 'PUF'}</div>
                <div>• Wall Thickness: ${results.construction?.thickness || 150}mm</div>
                <div>• Floor Thickness: ${results.construction?.floorThickness || 150}mm</div>
                <div>• U-Factor: ${(results.construction?.uFactor || 0.17).toFixed(3)} W/m²K</div>
            </div>
        </div>

        <div class="footer">
            <div style="font-size: 16px; font-weight: bold; color: #1E3A8A;">ENZO ENGINEERING SOLUTIONS</div>
            <div>Report generated by Enzo CoolCalc</div>
            <div>Professional Refrigeration Load Calculation System</div>
            <div>© ${new Date().getFullYear()} Enzo Engineering Solutions</div>
        </div>
    </body>
    </html>
    `;
  };

  const handleShare = async () => {
    try {
      // Try to generate PDF first if packages are available
      if (Print && Sharing) {
        try {
          const htmlContent = generateHTMLReport();
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
          });
          
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Share Freezer Load Calculation Report',
              UTI: 'com.adobe.pdf'
            });
            return;
          }
        } catch (pdfError) {
          console.log('PDF generation failed, falling back to text:', pdfError);
        }
      }
      
      // Fallback to text sharing
      const content = generateTextReport();
      await Share.share({
        message: content,
        title: 'Freezer Load Calculation Report'
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const generateTextReport = () => {
    if (!results) return '';
    
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ENZO ENGINEERING SOLUTIONS
⚡ POWERED BY ENZO COOLCALC ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️ FREEZER COOLING LOAD CALCULATION REPORT
==========================================

📅 Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

🎯 FINAL RESULTS:
Required Capacity: ${results.loadSummary.finalLoad.toFixed(2)} kW
Refrigeration: ${results.totalTR.toFixed(2)} TR
Daily Energy: ${(results.loadSummary.finalLoad * 24).toFixed(1)} kWh
Heat Removal: ${results.totalBTU.toFixed(0)} BTU/hr
SHR: ${results.loadSummary.SHR.toFixed(3)}

� INPUT PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ ROOM CONSTRUCTION:
Dimensions: ${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.height}m
Volume: ${results.volume.toFixed(1)} m³
Door Size: ${results.doorDimensions.width}m × ${results.doorDimensions.height}m
Door Openings: ${results.roomData?.doorOpenings || 'N/A'} per day
Insulation: ${results.construction?.type || 'PUF'} - ${results.construction?.thickness || 150}mm
Floor Thickness: ${results.roomData?.internalFloorThickness || 150}mm
Number of Floors: ${results.roomData?.numberOfFloors || 1}

🌡️ OPERATING CONDITIONS:
External Temperature: ${results.conditions?.externalTemp || 35}°C
Internal Temperature: ${results.conditions?.internalTemp || -18}°C
Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C
Operating Hours: ${results.conditions?.operatingHours || 24} hours/day
Pull Down Time: ${results.conditions?.pullDownTime || 10} hours
Room Humidity: ${results.conditions?.roomHumidity || 85}%
Air Flow per Fan: ${results.conditions?.airFlowPerFan || 2000} CFM
Steam Humidifier Load: ${results.conditions?.steamHumidifierLoad || 0} kW

🥩 PRODUCT INFORMATION:
Product Type: ${results.productData?.productType || 'General Food Items'}
Daily Load: ${results.productData?.dailyLoad || 1000} kg/day
Incoming Temperature: ${results.productData?.incomingTemp || 25}°C
Outgoing Temperature: ${results.productData?.outgoingTemp || -18}°C
Storage Type: ${results.productData?.storageType || 'Boxed'}

👥 PERSONNEL & EQUIPMENT:
Number of People: ${results.productData?.numberOfPeople || 2}
Working Hours: ${results.productData?.workingHours || 4} hours/day
Lighting Wattage: ${results.productData?.lightingWattage || 150} W
Equipment Load: ${results.productData?.equipmentLoad || 300} W
Fan Motor Rating: ${results.productData?.fanMotorRating || 0.37} kW
Number of Fans: ${results.productData?.numberOfFans || 6}
Fan Operating Hours: ${results.productData?.fanOperatingHours || 24} hours/day
Door Heaters Load: ${results.productData?.doorHeatersLoad || 0.24} kW
Tray Heaters Load: ${results.productData?.trayHeatersLoad || 2.0} kW
Peripheral Heaters Load: ${results.productData?.peripheralHeatersLoad || 0} kW

📊 LOAD BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transmission Load: ${results.breakdown.transmission.total.toFixed(2)} kW
  └─ Walls: ${results.breakdown.transmission.walls.toFixed(2)} kW
  └─ Ceiling: ${results.breakdown.transmission.ceiling.toFixed(2)} kW
  └─ Floor: ${results.breakdown.transmission.floor.toFixed(2)} kW

Product Load: ${results.breakdown.product.total.toFixed(2)} kW
  └─ Sensible (Above Freezing): ${results.breakdown.product.sensibleAbove.toFixed(2)} kW
  └─ Latent (Freezing): ${results.breakdown.product.latent.toFixed(2)} kW
  └─ Sensible (Below Freezing): ${results.breakdown.product.sensibleBelow.toFixed(2)} kW

Air Change Load: ${results.breakdown.airChange.load.toFixed(2)} kW
  └─ Air Flow Rate: ${results.breakdown.airChange.airFlowLperS.toFixed(1)} L/S

Internal Loads: ${results.breakdown.internal.total.toFixed(2)} kW
  └─ Occupancy: ${results.breakdown.internal.occupancy.toFixed(2)} kW
  └─ Lighting: ${results.breakdown.internal.lighting.toFixed(2)} kW
  └─ Fan Motors: ${results.breakdown.internal.fanMotor.toFixed(2)} kW
  └─ Door Heaters: ${results.breakdown.internal.doorHeaters.toFixed(2)} kW
  └─ Tray Heaters: ${results.breakdown.internal.trayHeaters.toFixed(2)} kW

Door Opening Load: ${results.breakdown.doorOpening.total.toFixed(2)} kW
  └─ Infiltration: ${results.breakdown.doorOpening.infiltration.toFixed(2)} kW
  └─ Heaters: ${results.breakdown.doorOpening.heaters.toFixed(2)} kW

📈 CALCULATION SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Sensible Load: ${results.loadSummary.totalSensible.toFixed(2)} kW
Total Latent Load: ${results.loadSummary.totalLatent.toFixed(2)} kW
Total Load (Before Safety): ${results.loadSummary.totalBeforeSafety.toFixed(2)} kW
Safety Factor (10%): ${results.loadSummary.safetyFactor.toFixed(2)} kW
FINAL CAPACITY REQUIRED: ${results.loadSummary.finalLoad.toFixed(2)} kW

📋 ADDITIONAL INFORMATION:
Air Circulation: ${(parseFloat(results.conditions?.totalAirFlow) || 0).toFixed(0)} CFM total
Number of Fans: ${Math.round(results.breakdown.internal.fanMotor / parseFloat(results.productData?.fanMotorRating || '0.37'))} units
Storage Capacity: ${(parseFloat(results.storageCapacity?.maximum) || 0).toFixed(0)} kg max
Door Clear Opening: ${results.breakdown.doorOpening.doorClearOpening.toFixed(2)} m²

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Enzo CoolCalc
ENZO ENGINEERING SOLUTIONS
Professional Refrigeration Load Calculation System
© ${new Date().getFullYear()} Enzo Engineering Solutions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  };

  // Recalculate whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      calculateResults();
    }, [])
  );

  // Also set up a listener for storage changes
  useEffect(() => {
    const interval = setInterval(() => {
      calculateResults();
    }, 1000); // Check for changes every second

    return () => clearInterval(interval);
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('roomData');
      const conditionsData = await AsyncStorage.getItem('conditionsData');
      const productData = await AsyncStorage.getItem('productData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '4.0', width: '3.0', height: '2.5', doorWidth: '1.0', doorHeight: '2.0',
        doorOpenings: '15', insulationType: 'PUF', insulationThickness: 150,
        internalFloorThickness: '150', numberOfFloors: '1'
      };
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        externalTemp: '35', internalTemp: '-18', operatingHours: '24', pullDownTime: '10',
        roomHumidity: '85', airFlowPerFan: '2000', steamHumidifierLoad: '0'
      };
      const product = productData ? JSON.parse(productData) : { 
        productType: 'General Food Items', dailyLoad: '1000', incomingTemp: '25', outgoingTemp: '-18',
        storageType: 'Boxed', numberOfPeople: '2', workingHours: '4',
        lightingWattage: '150', equipmentLoad: '300', fanMotorRating: '0.37',
        numberOfFans: '6', fanOperatingHours: '24', doorHeatersLoad: '0.24',
        trayHeatersLoad: '2.0', peripheralHeatersLoad: '0'
      };

      const calculatedResults = calculateEnhancedFreezerLoad(room, conditions, product);
      
      // Add input data to results for PDF generation
      const enhancedResults = {
        ...calculatedResults,
        roomData: room,
        conditions: conditions,
        productData: product
      };
      
      setResults(enhancedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculation Results" showBack={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Calculation Results" step={4} totalSteps={4} />
      
      {/* Powered by Enzo Banner */}
      <View style={styles.poweredByBanner}>
        <Text style={styles.poweredByText}>⚡ Powered by Enzo</Text>
      </View>
      
      <View style={styles.shareButtonsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 color="#3B82F6" size={20} strokeWidth={2} />
          <Text style={styles.shareButtonText}>Share PDF Report</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>🌡 FREEZER LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.loadSummary.finalLoad.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Refrigeration: {results.totalTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {(results.loadSummary.finalLoad * 24).toFixed(1)} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU.toFixed(0)} BTU/hr</Text>
          <Text style={styles.mainResultSubtitle}>SHR: {results.loadSummary.SHR.toFixed(3)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 TRANSMISSION LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Surface</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Area(m²)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>U-factor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>ΔT</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Walls</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.wall.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.wallsKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.walls.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Ceiling</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.ceiling.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.ceilingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceiling.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Floor</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.floor.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.construction.uFactor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{results.breakdown.transmission.floorKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floor.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>TOTAL TRANSMISSION</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1.5 }]}>{(results.breakdown.transmission.wallsKJDay + results.breakdown.transmission.ceilingKJDay + results.breakdown.transmission.floorKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥩 PRODUCT LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Above Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleAboveKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleAbove.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Latent Heat (Freezing)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.latentKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.latent.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Below Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleBelowKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleBelow.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL PRODUCT LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.product.sensibleAboveKJDay + results.breakdown.product.latentKJDay + results.breakdown.product.sensibleBelowKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.product.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💨 AIR CHANGE & INFILTRATION</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Value</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air flow rate</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.airFlowLperS.toFixed(1)} L/S</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Enthalpy difference</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.enthalpyDiff} kJ/L</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>Air infiltration load</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.airChange.airFlowKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.airChange.load.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚪 DOOR OPENING LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Infiltration</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.doorOpening.infiltration.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>-</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.doorOpening.heaters.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL DOOR LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.doorOpening.infiltrationKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.doorOpening.total.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>• Door clear opening: {results.breakdown.doorOpening.doorClearOpening.toFixed(2)} m²</Text>
            <Text style={styles.infoText}>• Door heaters: {results.breakdown.doorOpening.doorClearOpening > 1.8 ? 'Required' : 'Not required'} (threshold: 1.8 m²)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ INTERNAL LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Occupancy Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.occupancyKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.occupancy.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Lighting Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.lightingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.lighting.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Fan Motor Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.fanMotorKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.fanMotor.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.doorHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.doorHeaters.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Tray Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.trayHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.trayHeaters.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Steam Humidifiers</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.steamHumidifiersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.steamHumidifiers.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL INTERNAL</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.internal.occupancyKJDay + results.breakdown.internal.lightingKJDay + results.breakdown.internal.fanMotorKJDay + results.breakdown.internal.doorHeatersKJDay + results.breakdown.internal.trayHeatersKJDay + results.breakdown.internal.steamHumidifiersKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 FINAL SUMMARY</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Sensible Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalSensible * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalSensible.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Latent Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalLatent * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalLatent.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>SHR (Sensible Heat Ratio)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.SHR.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.totalBeforeSafety * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalBeforeSafety.toFixed(2)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Safety Factor (10%)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.loadSummary.safetyFactor * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.safetyFactor.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.finalRow]}>
              <Text style={[styles.tableCellFinal, { flex: 3 }]}>FINAL CAPACITY REQUIRED</Text>
              <Text style={[styles.tableCellFinal, { flex: 2 }]}>{(results.loadSummary.finalLoad * 24 * 3600 / 1000).toFixed(0)}</Text>
              <Text style={[styles.tableCellFinal, { flex: 1 }]}>{results.loadSummary.finalLoad.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Required Air Circulation</Text>
            <Text style={styles.infoText}>• Total Air Flow: {(parseFloat(results.conditions?.totalAirFlow) || 0).toFixed(0)} CFM</Text>
            <Text style={styles.infoText}>• Air Flow per Fan: {(parseFloat(results.conditions?.airFlowPerFan) || 0).toFixed(0)} CFM</Text>
            <Text style={styles.infoText}>• Number of Fans: {Math.round(results.breakdown.internal.fanMotor / parseFloat(results.productData?.fanMotorRating || '0.37'))} units</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Storage Capacity</Text>
            <Text style={styles.infoText}>• Maximum Capacity: {(parseFloat(results.storageCapacity?.maximum) || 0).toFixed(0)} kg</Text>
            <Text style={styles.infoText}>• Current Utilization: {(parseFloat(results.storageCapacity?.utilization) || 0).toFixed(1)}%</Text>
            <Text style={styles.infoText}>• Storage Type: {results.storageCapacity?.storageType || 'Boxed'}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction?.type || 'PUF'}</Text>
            <Text style={styles.infoText}>• Wall Thickness: {results.construction?.thickness || 150}mm</Text>
            <Text style={styles.infoText}>• Floor Thickness: {results.construction?.floorThickness || 150}mm</Text>
            <Text style={styles.infoText}>• U-Factor: {(results.construction?.uFactor || 0.17).toFixed(3)} W/m²K</Text>
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
  poweredByBanner: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F6',
  },
  poweredByText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#EBF8FF',
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  mainResultCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainResultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 8,
  },
  mainResultSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
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
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
    paddingTop: 8,
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
    marginTop: 8,
    paddingTop: 12,
    borderRadius: 8,
  },
  tableCell: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  tableCellBold: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
    textAlign: 'center',
  },
  tableCellFinal: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '700',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});