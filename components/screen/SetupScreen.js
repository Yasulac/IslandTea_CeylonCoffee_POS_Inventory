import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import addRecipeSystemData from '../../setup-recipe-system-data.js';

const SetupScreen = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      Alert.alert(
        'Setup Recipe System',
        'This will add sample inventory items, products, and recipes to your Firebase database. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                await addRecipeSystemData();
                setSetupComplete(true);
                Alert.alert(
                  'Setup Complete!',
                  'Recipe system data has been successfully added to your Firebase database.',
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Setup error:', error);
                Alert.alert(
                  'Setup Error',
                  'There was an error setting up the recipe system. Check the console for details.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Setup error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to start setup process.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Recipe System Setup</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={48} color="#007AFF" />
          <Text style={styles.infoTitle}>Recipe-Based Inventory System</Text>
          <Text style={styles.infoText}>
            This setup will create sample data for the recipe-based inventory system, including:
          </Text>
          
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• 10 Inventory Items (raw materials)</Text>
            <Text style={styles.listItem}>• 10 Products (finished goods)</Text>
            <Text style={styles.listItem}>• 8 Recipes (Bill of Materials)</Text>
          </View>

          <Text style={styles.warningText}>
            ⚠️ This will add data to your Firebase database. Make sure you're connected to the correct project.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.setupButton, isLoading && styles.setupButtonDisabled]}
          onPress={handleSetup}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.setupButtonText}>Setting up...</Text>
          ) : setupComplete ? (
            <Text style={styles.setupButtonText}>✓ Setup Complete</Text>
          ) : (
            <Text style={styles.setupButtonText}>Run Setup</Text>
          )}
        </TouchableOpacity>

        {setupComplete && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color="#34C759" />
            <Text style={styles.successTitle}>Setup Complete!</Text>
            <Text style={styles.successText}>
              Your recipe-based inventory system is now ready to use. You can:
            </Text>
            <Text style={styles.successText}>• View inventory items in the dashboard</Text>
            <Text style={styles.successText}>• Process sales with automatic inventory deduction</Text>
            <Text style={styles.successText}>• Track ingredient consumption</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  listContainer: {
    alignSelf: 'stretch',
    marginBottom: 15,
  },
  listItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    paddingLeft: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#FF9500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  setupButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  setupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successCard: {
    backgroundColor: '#f0fff0',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    marginTop: 10,
    marginBottom: 10,
  },
  successText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default SetupScreen;


