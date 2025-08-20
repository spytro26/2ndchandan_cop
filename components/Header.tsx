import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  step?: number;
  totalSteps?: number;
  showBack?: boolean;
}

export function Header({ title, step, totalSteps, showBack = true }: HeaderProps) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {showBack && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft color="#3B82F6" size={24} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {step && totalSteps && (
            <Text style={styles.stepIndicator}>Step {step} of {totalSteps}</Text>
          )}
        </View>
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  spacer: {
    width: 40,
  },
});