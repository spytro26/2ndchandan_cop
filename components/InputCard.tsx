import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface InputCardProps {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function InputCard({ label, unit, value, onChangeText, placeholder }: InputCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType="numeric"
          returnKeyType="done"
        />
        <View style={styles.unitContainer}>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FAFAFA',
  },
  unitContainer: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
});