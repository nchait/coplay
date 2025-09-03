/**
 * Network debugging utilities for React Native
 * Helps diagnose connection issues between the app and server
 */

export const NetworkDebug = {
  /**
   * Test basic connectivity to the server
   */
  async testServerConnection(baseUrl: string): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log(`Testing connection to: ${baseUrl}`);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Server connection successful:', data);
        return { success: true, details: data };
      } else {
        console.log(`Server responded with status: ${response.status}`);
        return { 
          success: false, 
          error: `Server returned ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      console.error('Server connection failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown network error' 
      };
    }
  },

  /**
   * Get network debugging information
   */
  getNetworkInfo(): {
    platform: string;
    environment: string;
    suggestions: string[];
  } {
    const platform = require('react-native').Platform.OS;
    const isDev = __DEV__;
    
    const suggestions: string[] = [];
    
    if (platform === 'android') {
      suggestions.push('For Android Emulator, use http://10.0.2.2:5000');
      suggestions.push('For Android Device, use http://YOUR_COMPUTER_IP:5000');
    } else if (platform === 'ios') {
      suggestions.push('For iOS Simulator, use http://localhost:5000');
      suggestions.push('For iOS Device, use http://YOUR_COMPUTER_IP:5000');
    }
    
    suggestions.push('Make sure your server is running on port 5000');
    suggestions.push('Check if your computer firewall allows connections on port 5000');
    
    return {
      platform,
      environment: isDev ? 'development' : 'production',
      suggestions,
    };
  },

  /**
   * Test token validation endpoint specifically
   */
  async testTokenValidation(baseUrl: string, token: string): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log(`Testing token validation at: ${baseUrl}/auth/me`);
      console.log(`Using token: ${token.substring(0, 20)}...`);
      
      const response = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      const data = await response.json();
      console.log('Token validation response:', response.status, data);

      if (response.ok) {
        return { success: true, details: data };
      } else {
        return { 
          success: false, 
          error: `Token validation failed: ${response.status}`,
          details: data
        };
      }
    } catch (error) {
      console.error('Token validation test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Print comprehensive debugging information
   */
  printDebugInfo(baseUrl: string): void {
    const info = this.getNetworkInfo();
    
    console.log('=== NETWORK DEBUG INFO ===');
    console.log(`Platform: ${info.platform}`);
    console.log(`Environment: ${info.environment}`);
    console.log(`API Base URL: ${baseUrl}`);
    console.log('Suggestions:');
    info.suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion}`);
    });
    console.log('========================');
  },
};

export default NetworkDebug;
