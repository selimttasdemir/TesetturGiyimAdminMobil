import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SupplierListScreen } from '../screens/suppliers/SupplierListScreen';
import { AddSupplierScreen } from '../screens/suppliers/AddSupplierScreen';
import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen';
import { EditSupplierScreen } from '../screens/suppliers/EditSupplierScreen';
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
      <Stack.Screen 
        name="SupplierDetail" 
        component={SupplierDetailScreen}
        options={{ title: 'Tedarikçi Detayları' }}
      />
      <Stack.Screen 
        name="EditSupplier" 
        component={EditSupplierScreen}
        options={{ title: 'Tedarikçi Düzenle' }}
      />
    </Stack.Navigator>
  );
};
