import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { healthService } from '../services/api';

export const ApiTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('Not tested');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    console.log('🧪 Testing API connection...');
    setIsLoading(true);
    try {
      const response = await healthService.checkHealth();
      console.log('🏥 Health check response:', response);
      
      if (response.data) {
        const status = `✅ API: ${response.data.status}, DB: ${response.data.database}`;
        setHealthStatus(status);
        Alert.alert('Success', 'API connection working!');
      } else {
        const error = `❌ Error: ${response.error}`;
        setHealthStatus(error);
        Alert.alert('Error', response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('💥 API test failed:', error);
      const errorMsg = `💥 Exception: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setHealthStatus(errorMsg);
      Alert.alert('Exception', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Test on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{healthStatus}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testApiConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        API URL: http://localhost:5000{'\n'}
        This test checks if the React Native app can connect to the Flask API.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
