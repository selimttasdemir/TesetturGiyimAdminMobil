import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SalesListScreen } from '../screens/sales/SalesListScreen';
import { NewSaleScreen } from '../screens/sales/NewSaleScreen';
import { SaleDetailScreen } from '../screens/sales/SaleDetailScreen';
import { BarcodeScannerScreen } from '../screens/products/BarcodeScannerScreen';
import { COLORS, FONT_SIZES } from '../constants';

const Stack = createStackNavigator();

export const SalesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: FONT_SIZES.lg,
        },
      }}
    >
      <Stack.Screen 
        name="SalesList" 
        component={SalesListScreen}
        options={{ title: 'Satışlar' }}
      />
      <Stack.Screen 
        name="NewSale" 
        component={NewSaleScreen}
        options={{ title: 'Yeni Satış' }}
      />
      <Stack.Screen 
        name="SaleDetail" 
        component={SaleDetailScreen}
        options={{ title: 'Satış Detayı' }}
      />
      <Stack.Screen 
        name="BarcodeScanner" 
        component={BarcodeScannerScreen}
        options={{ 
          title: 'Barkod Tara',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
