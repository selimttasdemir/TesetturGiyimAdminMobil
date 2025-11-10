import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useSaleStore } from '../../store/saleStore';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isWeb = Platform.OS === 'web';

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { fetchSales } = useSaleStore();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState({
    todaySales: 0,
    todayTransactions: 0,
    lowStockItems: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProducts({ pageSize: 5 }),
        fetchSales({ pageSize: 10 }),
        fetchDashboardStats(),
      ]);
    } catch (error) {
      console.error('Dashboard data load error:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = await useAuthStore.getState().token;
      const response = await fetch('http://localhost:8000/api/reports/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          todaySales: data.today_sales || 0,
          todayTransactions: data.today_transactions || 0,
          lowStockItems: data.low_stock_items || 0,
          totalProducts: data.total_products || 0,
        });
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    { 
      id: 1, 
      title: 'Hızlı Satış', 
      icon: 'cart-plus', 
      color: COLORS.primary, 
      screen: 'Sales',
      description: 'Yeni satış oluştur'
    },
    { 
      id: 2, 
      title: 'Ürün Ekle', 
      icon: 'hanger', 
      color: COLORS.success, 
      screen: 'Products',
      description: 'Yeni ürün ekle'
    },
    { 
      id: 3, 
      title: 'Barkod Tara', 
      icon: 'barcode-scan', 
      color: COLORS.secondary, 
      screen: 'Products',
      description: 'Barkod ile ara'
    },
    { 
      id: 4, 
      title: 'Raporlar', 
      icon: 'chart-line', 
      color: COLORS.info, 
      screen: 'Reports',
      description: 'Detaylı raporlar'
    },
  ];

  // Responsive card width
  const cardWidth = isWeb 
    ? Math.min((width - SPACING.md * 3) / 4, 150)
    : (width - SPACING.md * 3) / 2;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hoş Geldiniz,</Text>
          <Text style={[styles.userName, isSmallDevice && styles.userNameSmall]}>
            {user?.name || 'Kullanıcı'}
          </Text>
          <Text style={styles.storeName}>Tesettür Giyim</Text>
        </View>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="store" size={isSmallDevice ? 32 : 40} color={COLORS.primary} />
        </View>
      </View>

      {/* Stats Grid - Mobil uyumlu */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { width: cardWidth }, styles.statPrimary]}>
          <MaterialCommunityIcons 
            name="cash-multiple" 
            size={isSmallDevice ? 24 : 32} 
            color={COLORS.surface} 
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            ₺{stats.todaySales.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Bugünkü Satış
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statSuccess]}>
          <MaterialCommunityIcons 
            name="receipt" 
            size={isSmallDevice ? 24 : 32} 
            color={COLORS.surface} 
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {stats.todayTransactions}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            İşlem
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statWarning]}>
          <MaterialCommunityIcons 
            name="alert" 
            size={isSmallDevice ? 24 : 32} 
            color={COLORS.surface} 
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {stats.lowStockItems}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Düşük Stok
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statInfo]}>
          <MaterialCommunityIcons 
            name="hanger" 
            size={isSmallDevice ? 24 : 32} 
            color={COLORS.surface} 
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {stats.totalProducts}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Ürün
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Card title="Hızlı İşlemler" icon="lightning-bolt" iconColor={COLORS.primary}>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
                <MaterialCommunityIcons 
                  name={action.icon as any} 
                  size={32} 
                  color={action.color} 
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionCardTitle}>{action.title}</Text>
                <Text style={styles.actionCardDescription}>{action.description}</Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Recent Activity */}
      <Card title="Son Aktiviteler" icon="history" iconColor={COLORS.primary}>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: `${COLORS.success}15` }]}>
              <MaterialCommunityIcons name="cart-check" size={20} color={COLORS.success} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Ferace satışı tamamlandı</Text>
              <Text style={styles.activityTime}>5 dakika önce</Text>
            </View>
            <Text style={styles.activityAmount}>₺450</Text>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: `${COLORS.warning}15` }]}>
              <MaterialCommunityIcons name="alert" size={20} color={COLORS.warning} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Şal stoğu azaldı</Text>
              <Text style={styles.activityTime}>15 dakika önce</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: `${COLORS.info}15` }]}>
              <MaterialCommunityIcons name="hanger" size={20} color={COLORS.info} />
            </View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>Yeni tunik eklendi</Text>
              <Text style={styles.activityTime}>1 saat önce</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Bottom Spacing for mobile */}
      <View style={{ height: SPACING.xxl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userNameSmall: {
    fontSize: FONT_SIZES.lg,
  },
  storeName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  avatarContainer: {
    width: isSmallDevice ? 48 : 56,
    height: isSmallDevice ? 48 : 56,
    borderRadius: isSmallDevice ? 24 : 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statCard: {
    padding: isSmallDevice ? SPACING.md : SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isSmallDevice ? 110 : 130,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' } as any)
      : {
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }),
  },
  statPrimary: {
    backgroundColor: COLORS.primary,
  },
  statSuccess: {
    backgroundColor: COLORS.success,
  },
  statWarning: {
    backgroundColor: COLORS.warning,
  },
  statInfo: {
    backgroundColor: COLORS.secondary,
  },
  statValue: {
    fontSize: isSmallDevice ? FONT_SIZES.xl : FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginTop: SPACING.sm,
  },
  statValueSmall: {
    fontSize: FONT_SIZES.lg,
  },
  statLabel: {
    fontSize: isSmallDevice ? FONT_SIZES.xs : FONT_SIZES.sm,
    color: COLORS.surface,
    marginTop: 4,
    textAlign: 'center',
  },
  statLabelSmall: {
    fontSize: 10,
  },
  quickActionsGrid: {
    gap: SPACING.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } as any)
      : {
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        }),
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionCardDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionIcon: {
    width: isSmallDevice ? 48 : 56,
    height: isSmallDevice ? 48 : 56,
    borderRadius: isSmallDevice ? 24 : 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: isSmallDevice ? FONT_SIZES.xs : FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionTitleSmall: {
    fontSize: 11,
  },
  activityList: {
    gap: SPACING.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  activityAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
