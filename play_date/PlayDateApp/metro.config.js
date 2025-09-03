const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Set the port to 8070
config.server = {
  port: 8070,
};

module.exports = config;
