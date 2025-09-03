import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { healthService } from '../services/api';

export const AuthTest: React.FC = () => {
  const { state, login, register, logout } = useAuth();
  const [email, setEmail] = useState('test@playdate.com');
  const [password, setPassword] = useState('test123');
  const [name, setName] = useState('Test User');
  const [age, setAge] = useState('25');
  const [healthStatus, setHealthStatus] = useState<string>('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await register({
        email,
        password,
        name,
        age: parseInt(age) || 25,
      });
      Alert.alert('Success', 'Registered successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Logout failed');
    }
  };

  const checkHealth = async () => {
    try {
      const response = await healthService.checkHealth();
      if (response.data) {
        setHealthStatus(`API: ${response.data.status}, DB: ${response.data.database}`);
      } else {
        setHealthStatus(`Error: ${response.error}`);
      }
    } catch (error) {
      setHealthStatus(`Error: ${error instanceof Error ? error.message : 'Health check failed'}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Test</Text>
      
      {/* Health Check */}
      <TouchableOpacity style={styles.button} onPress={checkHealth}>
        <Text style={styles.buttonText}>Check API Health</Text>
      </TouchableOpacity>
      {healthStatus ? <Text style={styles.status}>{healthStatus}</Text> : null}
      
      {/* Auth Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {state.isAuthenticated ? 'Logged In' : 'Not Logged In'}
        </Text>
        {state.user && (
          <Text style={styles.statusText}>
            User: {state.user.name} ({state.user.email})
          </Text>
        )}
        {state.error && (
          <Text style={styles.errorText}>Error: {state.error}</Text>
        )}
        {state.isLoading && (
          <Text style={styles.statusText}>Loading...</Text>
        )}
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      {/* Action Buttons */}
      <TouchableOpacity 
        style={[styles.button, state.isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={state.isLoading}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, state.isLoading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={state.isLoading}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.logoutButton, state.isLoading && styles.buttonDisabled]} 
        onPress={handleLogout}
        disabled={state.isLoading}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
