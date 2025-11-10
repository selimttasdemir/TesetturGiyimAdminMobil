import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { PurchaseListScreen } from '../screens/purchases/PurchaseListScreen';
import { AddPurchaseScreen } from '../screens/purchases/AddPurchaseScreen';
import { COLORS, FONT_SIZES } from '../constants';

const Stack = createStackNavigator();

export const PurchaseNavigator = () => {
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
        name="PurchaseList"
        component={PurchaseListScreen}
        options={{ title: 'Satın Almalar' }}
      />
      <Stack.Screen
        name="AddPurchase"
        component={AddPurchaseScreen}
        options={{ title: 'Yeni Satın Alma' }}
      />
    </Stack.Navigator>
  );
};
