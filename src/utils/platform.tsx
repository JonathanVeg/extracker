import { Platform } from 'react-native';

export const getVersion = () => parseInt(Platform.Version, 10);
export const isAndroid = () => Platform.OS === 'android';
export const isIOS = () => Platform.OS === 'ios';
