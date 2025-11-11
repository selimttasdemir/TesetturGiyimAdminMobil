import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { CustomersScreen } from '../screens/customers/CustomersScreen';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen';
import { InventoryScreen } from '../screens/inventory/InventoryScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { ProductNavigator } from './ProductNavigator';
import { SalesNavigator } from './SalesNavigator';
import { SupplierNavigator } from './SupplierNavigator';
import { PurchaseNavigator } from './PurchaseNavigator';
import { Sidebar } from '../components/layout';
import { COLORS, FONT_SIZES } from '../constants';
import { isWeb, isMobileSize, getSidebarWidth } from '../utils/platform';

const Tab = createBottomTabNavigator();

// Navigation için global ref
let navigationRef: any = null;

export const MainNavigator = () => {
  const showSidebar = isWeb && !isMobileSize;
  const sidebarWidth = getSidebarWidth();

  // Mobilde daha basit yapı
  if (!showSidebar) {
    return (
      <Tab.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.surface,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: FONT_SIZES.lg,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Ana Sayfa',
            tabBarLabel: 'Ana Sayfa',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Products"
          component={ProductNavigator}
          options={{
            headerShown: false,
            title: 'Ürünler',
            tabBarLabel: 'Ürünler',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="package-variant" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{
            title: 'Kategoriler',
            tabBarLabel: 'Kategori',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="tag-multiple" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Sales"
          component={SalesNavigator}
          options={{
            headerShown: false,
            title: 'Satış',
            tabBarLabel: 'Satış',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cart" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Suppliers"
          component={SupplierNavigator}
          options={{
            headerShown: false,
            title: 'Tedarikçiler',
            tabBarLabel: 'Tedarikçi',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="truck" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{
            title: 'Raporlar',
            tabBarLabel: 'Raporlar',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Purchases"
          component={PurchaseNavigator}
          options={{
            headerShown: false,
            title: 'Satın Almalar',
            tabBarLabel: 'Satın Alma',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="package-variant" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Customers"
          component={CustomersScreen}
          options={{
            title: 'Müşteriler',
            tabBarLabel: 'Müşteriler',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-group" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{
            title: 'Stok Yönetimi',
            tabBarLabel: 'Stok',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="warehouse" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Ayarlar',
            tabBarLabel: 'Ayarlar',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Web versiyonu - Sidebar ile
  return (
    <WebNavigatorWithSidebar sidebarWidth={sidebarWidth} />
  );
};

const WebNavigatorWithSidebar = ({ sidebarWidth }: { sidebarWidth: number }) => {
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  return (
    <View style={styles.container}>
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={(routeName) => {
          if (navigationRef) {
            navigationRef.navigate(routeName);
            setActiveRoute(routeName);
          }
        }}
      />
      <View style={[styles.content, { marginLeft: sidebarWidth }]}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: FONT_SIZES.lg,
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
              display: 'none',
            } as any,
            tabBarLabelStyle: {
              fontSize: FONT_SIZES.sm,
              fontWeight: '500',
            },
          }}
          screenListeners={{
            state: (e) => {
              const state = e.data.state;
              if (state) {
                const currentRoute = state.routes[state.index];
                if (currentRoute) {
                  setActiveRoute(currentRoute.name);
                }
              }
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Ana Sayfa',
              tabBarLabel: 'Ana Sayfa',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
              ),
            }}
            listeners={({ navigation }) => {
              navigationRef = navigation;
              return {};
            }}
          />

          <Tab.Screen
            name="Products"
            component={ProductNavigator}
            options={{
              headerShown: false,
              title: 'Ürünler',
              tabBarLabel: 'Ürünler',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="package-variant" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Categories"
            component={CategoriesScreen}
            options={{
              title: 'Kategoriler',
              tabBarLabel: 'Kategoriler',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="tag-multiple" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Sales"
            component={SalesNavigator}
            options={{
              headerShown: false,
              title: 'Satış',
              tabBarLabel: 'Satış',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cart" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Suppliers"
            component={SupplierNavigator}
            options={{
              headerShown: false,
              title: 'Tedarikçiler',
              tabBarLabel: 'Tedarikçi',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="truck" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Reports"
            component={ReportsScreen}
            options={{
              title: 'Raporlar',
              tabBarLabel: 'Raporlar',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="chart-line" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Purchases"
            component={PurchaseNavigator}
            options={{
              headerShown: false,
              title: 'Satın Almalar',
              tabBarLabel: 'Satın Alma',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="package-variant" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Customers"
            component={CustomersScreen}
            options={{
              title: 'Müşteriler',
              tabBarLabel: 'Müşteriler',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account-group" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Inventory"
            component={InventoryScreen}
            options={{
              title: 'Stok Yönetimi',
              tabBarLabel: 'Stok',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="warehouse" size={size} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Ayarlar',
              tabBarLabel: 'Ayarlar',
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
