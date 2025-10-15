// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Adiciona suporte para arquivos .wasm
// Isso é necessário para o expo-sqlite funcionar na web.
config.resolver.assetExts.push('wasm');

// É importante que o 'sourceExts' inclua 'mjs' para algumas dependências.
config.resolver.sourceExts.push('mjs');

module.exports = config;