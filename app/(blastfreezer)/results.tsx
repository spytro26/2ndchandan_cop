import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateBlastFreezerLoad } from '@/utils/blastFreezerCalculations';

// Try to import expo-print and expo-sharing, but don't fail if they're not available
let Print: any = null;
let Sharing: any = null;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
} catch (error) {
  console.log('PDF packages not available, will use text sharing fallback');
}

export default function BlastFreezerResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generateHTMLReport = () => {
    if (!results) return '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Blast Freezer Cooling Load Report</title>
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
            <div class="title">❄️ BLAST FREEZER COOLING LOAD CALCULATION REPORT</div>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="main-result">
            <div class="main-value">${results.loadSummary.finalLoadTR.toFixed(2)} TR</div>
            <div>Required Cooling Capacity</div>
            <div style="margin-top: 10px;">
                <div>Power: ${results.loadSummary.finalLoadKW.toFixed(2)} kW</div>
                <div>Daily Energy: ${results.dailyEnergyConsumption?.toFixed(1) || '0.0'} kWh</div>
                <div>Heat Removal: ${results.totalBTU?.toFixed(0) || '0'} BTU/hr</div>
                <div>Safety Factor: ${results.loadSummary.safetyPercentage.toFixed(0)}%</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📋 INPUT PARAMETERS</div>
            
            <div class="subsection">
                <div class="subsection-title">🏗️ Room Construction</div>
                <div class="info-box">
                    <div><strong>Room Dimensions:</strong></div>
                    <div>• Length: ${results.dimensions.length} m</div>
                    <div>• Breadth: ${results.dimensions.breadth} m</div>
                    <div>• Height: ${results.dimensions.height} m</div>
                    <div>• Total Volume: ${results.volume.toFixed(1)} m³</div>
                </div>
                <div class="info-box">
                    <div><strong>Door Specifications:</strong></div>
                    <div>• Door Width: ${results.doorDimensions.width} m</div>
                    <div>• Door Height: ${results.doorDimensions.height} m</div>
                </div>
                <div class="info-box">
                    <div><strong>Insulation Details:</strong></div>
                    <div>• Insulation Type: ${results.construction.type}</div>
                    <div>• Wall Thickness: ${results.construction.wallThickness} mm</div>
                    <div>• Ceiling Thickness: ${results.construction.ceilingThickness} mm</div>
                    <div>• Floor Thickness: ${results.construction.floorThickness} mm</div>
                    <div>• Internal Floor: ${results.construction.internalFloorThickness} mm</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🌡️ Operating Conditions</div>
                <div class="info-box">
                    <div><strong>Temperature Settings:</strong></div>
                    <div>• Ambient Temperature: ${results.roomData?.ambientTemp || results.conditions?.ambientTemp}°C</div>
                    <div>• Room Temperature: ${results.roomData?.roomTemp || results.conditions?.roomTemp}°C</div>
                    <div>• Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C</div>
                </div>
                <div class="info-box">
                    <div><strong>Operating Parameters:</strong></div>
                    <div>• Batch Hours: ${results.batchHours || results.roomData?.batchHours} hours</div>
                    <div>• Operating Hours: ${results.roomData?.operatingHours || 24} hours/day</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🥩 Product Information</div>
                <div class="info-box">
                    <div><strong>Product Details:</strong></div>
                    <div>• Product Type: ${results.productInfo.type}</div>
                    <div>• Batch Capacity: ${results.productInfo.mass} kg</div>
                    <div>• Incoming Temperature: ${results.productInfo.incomingTemp}°C</div>
                    <div>• Outgoing Temperature: ${results.productInfo.outgoingTemp}°C</div>
                    <div>• Storage Capacity: ${results.roomData?.storageCapacity || 'N/A'} tons</div>
                    <div>• Storage Density: ${results.storageCapacity.density} kg/m³</div>
                    <div>• Storage Utilization: ${results.storageCapacity.utilization.toFixed(1)}%</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">👥 Personnel & Equipment</div>
                <div class="info-box">
                    <div><strong>Personnel:</strong></div>
                    <div>• Number of People: ${results.roomData?.numberOfPeople || 2}</div>
                    <div>• Working Hours: ${results.roomData?.workingHours || 4} hours/day</div>
                </div>
                <div class="info-box">
                    <div><strong>Electrical Equipment:</strong></div>
                    <div>• Light Load: ${results.roomData?.lightLoad || 0.1} kW</div>
                    <div>• Fan Motor Rating: ${results.roomData?.fanMotorRating || 0.37} kW</div>
                </div>
                <div class="info-box">
                    <div><strong>Heaters:</strong></div>
                    <div>• Peripheral Heaters: ${results.roomData?.peripheralHeatersQty || 1} × ${results.roomData?.peripheralHeatersCapacity || 1.5} kW</div>
                    <div>• Door Heaters: ${results.roomData?.doorHeatersQty || 1} × ${results.roomData?.doorHeatersCapacity || 0.27} kW</div>
                    <div>• Tray Heaters: ${results.roomData?.trayHeatersQty || 1} × ${results.roomData?.trayHeatersCapacity || 2.2} kW</div>
                    <div>• Drain Heaters: ${results.roomData?.drainHeatersQty || 1} × ${results.roomData?.drainHeatersCapacity || 0.04} kW</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📈 FINAL SUMMARY</div>
            <table>
                <tr>
                    <th>Load Type</th>
                    <th>Load (kW)</th>
                    <th>Load (TR)</th>
                </tr>
                <tr>
                    <td>Transmission Load</td>
                    <td>${results.breakdown.transmission.total.toFixed(2)}</td>
                    <td>${results.breakdown.transmission.totalTR.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Product Load</td>
                    <td>${(results.breakdown.product.total * 3.517).toFixed(2)}</td>
                    <td>${results.breakdown.product.total.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Air Change Load</td>
                    <td>${results.breakdown.airChange.loadKW?.toFixed(2) || '0.00'}</td>
                    <td>${results.breakdown.airChange.loadTR.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Internal Load</td>
                    <td>${(results.breakdown.internal.total * 3.517).toFixed(2)}</td>
                    <td>${results.breakdown.internal.total.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Total Calculated</td>
                    <td>${results.loadSummary.totalCalculatedKW.toFixed(2)}</td>
                    <td>${results.loadSummary.totalCalculatedTR.toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Safety Factor (5%)</td>
                    <td>${results.loadSummary.safetyFactorKW.toFixed(2)}</td>
                    <td>${results.loadSummary.safetyFactorTR.toFixed(3)}</td>
                </tr>
                <tr class="final-row">
                    <td><strong>FINAL CAPACITY REQUIRED</strong></td>
                    <td><strong>${results.loadSummary.finalLoadKW.toFixed(2)}</strong></td>
                    <td><strong>${results.loadSummary.finalLoadTR.toFixed(2)}</strong></td>
                </tr>
            </table>
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
              dialogTitle: 'Share Blast Freezer Load Calculation Report',
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
        title: 'Blast Freezer Load Calculation Report'
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

❄️ BLAST FREEZER COOLING LOAD CALCULATION REPORT
================================================

📅 Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

🎯 FINAL RESULTS:
Required Capacity: ${results.loadSummary.finalLoadTR.toFixed(2)} TR
Power: ${results.loadSummary.finalLoadKW.toFixed(2)} kW
Daily Energy: ${results.dailyEnergyConsumption?.toFixed(1) || '0.0'} kWh
Heat Removal: ${results.totalBTU?.toFixed(0) || '0'} BTU/hr
Safety Factor: ${results.loadSummary.safetyPercentage.toFixed(0)}%

📋 INPUT PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ ROOM CONSTRUCTION:
Dimensions: ${results.dimensions.length}m × ${results.dimensions.breadth}m × ${results.dimensions.height}m
Volume: ${results.volume.toFixed(1)} m³
Door Size: ${results.doorDimensions.width}m × ${results.doorDimensions.height}m
Insulation: ${results.construction.type}
Wall/Ceiling/Floor: ${results.construction.wallThickness}/${results.construction.ceilingThickness}/${results.construction.floorThickness}mm

🌡️ OPERATING CONDITIONS:
Ambient Temperature: ${results.roomData?.ambientTemp || results.conditions?.ambientTemp}°C
Room Temperature: ${results.roomData?.roomTemp || results.conditions?.roomTemp}°C
Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C
Batch Hours: ${results.batchHours || results.roomData?.batchHours} hours
Operating Hours: ${results.roomData?.operatingHours || 24} hours/day

🥩 PRODUCT INFORMATION:
Product Type: ${results.productInfo.type}
Batch Capacity: ${results.productInfo.mass} kg
Temperature Range: ${results.productInfo.incomingTemp}°C → ${results.productInfo.outgoingTemp}°C
Storage Density: ${results.storageCapacity.density} kg/m³
Storage Utilization: ${results.storageCapacity.utilization.toFixed(1)}%

👥 PERSONNEL & EQUIPMENT:
Number of People: ${results.roomData?.numberOfPeople || 2}
Working Hours: ${results.roomData?.workingHours || 4} hours/day
Light Load: ${results.roomData?.lightLoad || 0.1} kW
Fan Motor: ${results.roomData?.fanMotorRating || 0.37} kW

⚡ HEATER LOADS:
Peripheral: ${results.roomData?.peripheralHeatersQty || 1} × ${results.roomData?.peripheralHeatersCapacity || 1.5} kW
Door: ${results.roomData?.doorHeatersQty || 1} × ${results.roomData?.doorHeatersCapacity || 0.27} kW
Tray: ${results.roomData?.trayHeatersQty || 1} × ${results.roomData?.trayHeatersCapacity || 2.2} kW
Drain: ${results.roomData?.drainHeatersQty || 1} × ${results.roomData?.drainHeatersCapacity || 0.04} kW

📊 LOAD BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transmission Load: ${results.breakdown.transmission.totalTR.toFixed(3)} TR
Product Load: ${results.breakdown.product.total.toFixed(3)} TR
Air Change Load: ${results.breakdown.airChange.loadTR.toFixed(3)} TR
Internal Loads: ${results.breakdown.internal.total.toFixed(3)} TR

📈 CALCULATION SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Calculated: ${results.loadSummary.totalCalculatedTR.toFixed(3)} TR
Safety Factor (5%): ${results.loadSummary.safetyFactorTR.toFixed(3)} TR
FINAL CAPACITY REQUIRED: ${results.loadSummary.finalLoadTR.toFixed(2)} TR

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
      const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
      const conditionsData = await AsyncStorage.getItem('blastFreezerConditionsData');
      const constructionData = await AsyncStorage.getItem('blastFreezerConstructionData');
      const productData = await AsyncStorage.getItem('blastFreezerProductData');
      const usageData = await AsyncStorage.getItem('blastFreezerUsageData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '5.0', breadth: '5.0', height: '3.5', doorWidth: '2.1', doorHeight: '2.1'
      };
      
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        ambientTemp: '43', roomTemp: '-35', batchHours: '8', operatingHours: '24'
      };
      
      const construction = constructionData ? JSON.parse(constructionData) : {
        insulationType: 'PUF', wallThickness: 150, ceilingThickness: 150, 
        floorThickness: 150, internalFloorThickness: '150'
      };
      
      const product = productData ? JSON.parse(productData) : { 
        productType: 'Chicken', capacityRequired: '2000', incomingTemp: '-5', outgoingTemp: '-30',
        storageCapacity: '4', numberOfPeople: '2', workingHours: '4',
        lightLoad: '0.1', fanMotorRating: '0.37'
      };

      const usage = usageData ? JSON.parse(usageData) : {
        peripheralHeatersQty: '1', peripheralHeatersCapacity: '1.5',
        doorHeatersQty: '1', doorHeatersCapacity: '0.27',
        trayHeatersQty: '1', trayHeatersCapacity: '2.2',
        drainHeatersQty: '1', drainHeatersCapacity: '0.04'
      };

      // Merge all data
      const roomWithConstruction = { ...room, ...construction };
      const productWithUsage = { ...product, ...usage };

      const calculatedResults = calculateBlastFreezerLoad(roomWithConstruction, conditions, productWithUsage);
      
      // Add input data to results for PDF generation using enhanced object approach
      const enhancedResults = {
        ...calculatedResults,
        roomData: { ...roomWithConstruction, ...conditions },
        conditions: conditions,
        productData: productWithUsage
      };
      
      setResults(enhancedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating blast freezer results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Blast Freezer Results" step={6} totalSteps={6} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Blast Freezer Results" step={6} totalSteps={6} />
      
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
          <Text style={styles.mainResultTitle}>❄️ BLAST FREEZER LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.loadSummary.finalLoadTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Power: {results.loadSummary.finalLoadKW.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {results.dailyEnergyConsumption?.toFixed(1) || '0.0'} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU?.toFixed(0) || '0'} BTU/hr</Text>
          <Text style={styles.mainResultSubtitle}>Safety Factor: {results.loadSummary.safetyPercentage.toFixed(0)}%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 TRANSMISSION LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Surface</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Area(m²)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>U-factor</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>ΔT</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>kW</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Walls</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.wall.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.thermalProperties.wallUFactor.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.walls.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.wallsTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Ceiling</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.ceiling.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.thermalProperties.ceilingUFactor.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceiling.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.ceilingTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Floor</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.areas.floor.toFixed(1)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.thermalProperties.floorUFactor.toFixed(3)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.temperatureDifference.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floor.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.floorTR.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>TOTAL TRANSMISSION</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>-</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.transmission.totalTR.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥩 PRODUCT LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Above Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleAboveKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleAbove.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Latent Heat (Freezing)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.latentKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.latent.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Sensible Heat (Below Frzg)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.product.sensibleBelowKJ.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.sensibleBelow.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL PRODUCT LOAD</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.product.sensibleAboveKJ + results.breakdown.product.latentKJ + results.breakdown.product.sensibleBelowKJ).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.product.total.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💨 AIR CHANGE LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Value</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air change rate</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.airChangeRate} changes/hr</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Enthalpy difference</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.enthalpyDiff} kJ/kg</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>-</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>Air change load</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{results.breakdown.airChange.totalKJDay.toFixed(0)} kJ/day</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.airChange.loadTR.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ INTERNAL LOADS</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Component</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Load(kJ/day)</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Occupancy Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.occupancyKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.occupancy.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Lighting Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.lightingKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.lighting.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Equipment Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.equipmentKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.equipment.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Peripheral Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.peripheralHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.peripheralHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Door Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.doorHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.doorHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Tray Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.trayHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.trayHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Drain Heaters</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.internal.drainHeatersKJDay.toFixed(0)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.drainHeaters.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>TOTAL INTERNAL</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>{(results.breakdown.internal.occupancyKJDay + results.breakdown.internal.lightingKJDay + results.breakdown.internal.equipmentKJDay + results.breakdown.internal.peripheralHeatersKJDay + results.breakdown.internal.doorHeatersKJDay + results.breakdown.internal.trayHeatersKJDay + results.breakdown.internal.drainHeatersKJDay).toFixed(0)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(3)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 FINAL SUMMARY</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Load Type</Text>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>kW</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>TR</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Transmission Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.transmission.total.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.transmission.totalTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Product Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.breakdown.product.total * 3.517).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.product.total.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Air Change Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.breakdown.airChange.loadKW?.toFixed(2) || '0.00'}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.airChange.loadTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Internal Load</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{(results.breakdown.internal.total * 3.517).toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.breakdown.internal.total.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Total Calculated</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.totalCalculatedKW.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.totalCalculatedTR.toFixed(3)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>Safety Factor (5%)</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{results.loadSummary.safetyFactorKW.toFixed(2)}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{results.loadSummary.safetyFactorTR.toFixed(3)}</Text>
            </View>
            
            <View style={[styles.tableRow, styles.finalRow]}>
              <Text style={[styles.tableCellFinal, { flex: 3 }]}>FINAL CAPACITY REQUIRED</Text>
              <Text style={[styles.tableCellFinal, { flex: 2 }]}>{results.loadSummary.finalLoadKW.toFixed(2)}</Text>
              <Text style={[styles.tableCellFinal, { flex: 1 }]}>{results.loadSummary.finalLoadTR.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Blast Freezer Specifications Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {results.dimensions.length}m × {results.dimensions.breadth}m × {results.dimensions.height}m</Text>
            <Text style={styles.infoText}>• Door size: {results.doorDimensions.width}m × {results.doorDimensions.height}m</Text>
            <Text style={styles.infoText}>• Room volume: {results.volume.toFixed(1)} m³</Text>
            <Text style={styles.infoText}>• Temperature difference: {results.temperatureDifference.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Batch time: {results.batchHours} hours</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Wall thickness: {results.construction.wallThickness}mm</Text>
            <Text style={styles.infoText}>• Ceiling thickness: {results.construction.ceilingThickness}mm</Text>
            <Text style={styles.infoText}>• Floor thickness: {results.construction.floorThickness}mm</Text>
            <Text style={styles.infoText}>• Internal floor: {results.construction.internalFloorThickness}mm</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Product Information</Text>
            <Text style={styles.infoText}>• Product: {results.productInfo.type}</Text>
            <Text style={styles.infoText}>• Batch capacity: {results.productInfo.mass} kg</Text>
            <Text style={styles.infoText}>• Temperature range: {results.productInfo.incomingTemp}°C → {results.productInfo.outgoingTemp}°C</Text>
            <Text style={styles.infoText}>• Storage density: {results.storageCapacity.density} kg/m³</Text>
            <Text style={styles.infoText}>• Storage utilization: {results.storageCapacity.utilization.toFixed(1)}%</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Equipment Summary</Text>
            <Text style={styles.infoText}>• Total heater load: {results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW</Text>
            <Text style={styles.infoText}>• Fan motor load: {results.equipmentSummary.totalFanLoad} kW</Text>
            <Text style={styles.infoText}>• Lighting load: {results.equipmentSummary.totalLightingLoad} kW</Text>
            <Text style={styles.infoText}>• People load: {results.equipmentSummary.totalPeopleLoad.toFixed(3)} kW</Text>
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
