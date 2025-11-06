import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Sidebar, Header } from '../components/layout';
import { DashboardScreen } from '../screens/dashboard/DashboardScreenNew';
import { ProductNavigator } from './ProductNavigator';
import { SalesNavigator } from './SalesNavigator';
import { SupplierNavigator } from './SupplierNavigator';
import { COLORS } from '../constants';
import { isWeb, isMobileSize } from '../utils/platform';

const Stack = createStackNavigator();

const WebLayout = () => {
  const navigation = useNavigation();
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    navigation.navigate(route as never);
  };

  return (
    <>
      {/* Sidebar - Only on web desktop/tablet */}
      {isWeb && !isMobileSize && (
        <Sidebar 
          activeRoute={activeRoute} 
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
};

export const WebNavigator = () => {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
        }}
      >
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{
            title: 'Ana Panel',
          }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductNavigator}
          options={{
            headerShown: false,
            title: 'Ürün Yönetimi',
          }}
        />
        <Stack.Screen 
          name="Sales" 
          component={SalesNavigator}
          options={{
            headerShown: false,
            title: 'Satış Yönetimi',
          }}
        />
        <Stack.Screen 
          name="Suppliers" 
          component={SupplierNavigator}
          options={{
            headerShown: false,
            title: 'Tedarikçi Yönetimi',
          }}
        />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
