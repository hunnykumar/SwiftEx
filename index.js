/**
 * @format
 */
import './shim';
import 'react-native-get-random-values'; // For RandomBytes support
import { Buffer } from 'buffer';
global.Buffer = Buffer;
global.process = require('process'); // Polyfill for process
import { AppRegistry } from 'react-native';
import App from './App'; // Ensure this points to the correct file
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
