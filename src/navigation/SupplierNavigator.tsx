import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SupplierListScreen } from '../screens/suppliers/SupplierListScreen';
import { AddSupplierScreen } from '../screens/suppliers/AddSupplierScreen';
import { COLORS, FONT_SIZES } from '../constants';

const Stack = createStackNavigator();

export const SupplierNavigator = () => {
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
        name="SupplierList" 
        component={SupplierListScreen}
        options={{ title: 'Tedarikçiler' }}
      />
      <Stack.Screen 
        name="AddSupplier" 
        component={AddSupplierScreen}
        options={{ title: 'Yeni Tedarikçi Ekle' }}
      />
    </Stack.Navigator>
  );
};
