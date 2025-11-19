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
    todayProfit: 0,
    todayCost: 0,
    monthlySales: 0,
    monthlyTransactions: 0,
    monthlyProfit: 0,
    monthlyCost: 0,
    totalSales: 0,
    totalTransactions: 0,
    totalProfit: 0,
    totalCost: 0,
    lowStockItems: 0,
    totalProducts: 0,
  });
  const [activities, setActivities] = React.useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProducts({ pageSize: 5 }),
        fetchSales({ pageSize: 10 }),
        fetchDashboardStats(),
        fetchRecentActivities(),
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
          todayProfit: data.today_profit || 0,
          todayCost: data.today_cost || 0,
          monthlySales: data.monthly_sales || 0,
          monthlyTransactions: data.monthly_transactions || 0,
          monthlyProfit: data.monthly_profit || 0,
          monthlyCost: data.monthly_cost || 0,
          totalSales: data.total_sales || 0,
          totalTransactions: data.total_transactions || 0,
          totalProfit: data.total_profit || 0,
          totalCost: data.total_cost || 0,
          lowStockItems: data.low_stock_items || 0,
          totalProducts: data.total_products || 0,
        });
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const token = await useAuthStore.getState().token;
      const response = await fetch('http://localhost:8000/api/reports/recent-activities?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Recent activities error:', error);
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

  // Responsive card width - 6 kart için
  const cardWidth = isWeb
    ? Math.min((width - SPACING.md * 4) / 3, 200) // Web: 3 sütun
    : (width - SPACING.md * 3) / 2; // Mobil: 2 sütun

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
            {`₺${stats.todaySales.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Bugünkü Satış
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statSuccess]}>
          <MaterialCommunityIcons
            name="calendar-month"
            size={isSmallDevice ? 24 : 32}
            color={COLORS.surface}
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {`₺${stats.monthlySales.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Aylık Satış
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statInfo]}>
          <MaterialCommunityIcons
            name="chart-line"
            size={isSmallDevice ? 24 : 32}
            color={COLORS.surface}
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {`₺${stats.totalSales.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Toplam Satış
          </Text>
        </View>

        <View style={[styles.statCard, { width: cardWidth }, styles.statSecondary]}>
          <MaterialCommunityIcons
            name="receipt"
            size={isSmallDevice ? 24 : 32}
            color={COLORS.surface}
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {stats.todayTransactions}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Bugün İşlem
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

        <View style={[styles.statCard, { width: cardWidth }, styles.statDark]}>
          <MaterialCommunityIcons
            name="hanger"
            size={isSmallDevice ? 24 : 32}
            color={COLORS.surface}
          />
          <Text style={[styles.statValue, isSmallDevice && styles.statValueSmall]}>
            {stats.totalProducts}
          </Text>
          <Text style={[styles.statLabel, isSmallDevice && styles.statLabelSmall]}>
            Toplam Ürün
          </Text>
        </View>
      </View>

      {/* Ciro Takibi - Kar/Zarar Analizi */}
      <Card title="Ciro Takibi" icon="chart-box" iconColor={COLORS.success}>
        <View style={styles.profitContainer}>
          {/* Bugün */}
          <View style={styles.profitCard}>
            <View style={styles.profitHeader}>
              <MaterialCommunityIcons name="calendar-today" size={20} color={COLORS.primary} />
              <Text style={styles.profitPeriod}>Bugün</Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Satış:</Text>
              <Text style={styles.profitValue}>
                ₺{stats.todaySales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Maliyet:</Text>
              <Text style={[styles.profitValue, { color: COLORS.error }]}>
                ₺{stats.todayCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.profitRow, styles.profitTotalRow]}>
              <Text style={styles.profitTotalLabel}>Net Kar:</Text>
              <Text style={[styles.profitTotalValue, { color: stats.todayProfit >= 0 ? COLORS.success : COLORS.error }]}>
                ₺{stats.todayProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitMargin}>
              <Text style={styles.profitMarginLabel}>Kar Marjı:</Text>
              <Text style={styles.profitMarginValue}>
                {stats.todaySales > 0 ? `%${((stats.todayProfit / stats.todaySales) * 100).toFixed(1)}` : '%0.0'}
              </Text>
            </View>
          </View>

          {/* Bu Ay */}
          <View style={styles.profitCard}>
            <View style={styles.profitHeader}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={COLORS.success} />
              <Text style={styles.profitPeriod}>Bu Ay</Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Satış:</Text>
              <Text style={styles.profitValue}>
                ₺{stats.monthlySales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Maliyet:</Text>
              <Text style={[styles.profitValue, { color: COLORS.error }]}>
                ₺{stats.monthlyCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.profitRow, styles.profitTotalRow]}>
              <Text style={styles.profitTotalLabel}>Net Kar:</Text>
              <Text style={[styles.profitTotalValue, { color: stats.monthlyProfit >= 0 ? COLORS.success : COLORS.error }]}>
                ₺{stats.monthlyProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitMargin}>
              <Text style={styles.profitMarginLabel}>Kar Marjı:</Text>
              <Text style={styles.profitMarginValue}>
                {stats.monthlySales > 0 ? `%${((stats.monthlyProfit / stats.monthlySales) * 100).toFixed(1)}` : '%0.0'}
              </Text>
            </View>
          </View>

          {/* Toplam */}
          <View style={styles.profitCard}>
            <View style={styles.profitHeader}>
              <MaterialCommunityIcons name="chart-line" size={20} color={COLORS.info} />
              <Text style={styles.profitPeriod}>Toplam</Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Satış:</Text>
              <Text style={styles.profitValue}>
                ₺{stats.totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitRow}>
              <Text style={styles.profitLabel}>Maliyet:</Text>
              <Text style={[styles.profitValue, { color: COLORS.error }]}>
                ₺{stats.totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={[styles.profitRow, styles.profitTotalRow]}>
              <Text style={styles.profitTotalLabel}>Net Kar:</Text>
              <Text style={[styles.profitTotalValue, { color: stats.totalProfit >= 0 ? COLORS.success : COLORS.error }]}>
                ₺{stats.totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.profitMargin}>
              <Text style={styles.profitMarginLabel}>Kar Marjı:</Text>
              <Text style={styles.profitMarginValue}>
                {stats.totalSales > 0 ? `%${((stats.totalProfit / stats.totalSales) * 100).toFixed(1)}` : '%0.0'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Hızlı İşlemler ve Son Aktiviteler - Yan Yana */}
      <View style={styles.sideBySideContainer}>
        {/* Quick Actions */}
        <View style={styles.sideBySideCard}>
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
        </View>

        {/* Recent Activity */}
        <View style={styles.sideBySideCard}>
          <Card title="Son Aktiviteler" icon="history" iconColor={COLORS.primary}>
            <View style={styles.activityList}>
              {activities.length > 0 ? (
                activities.map((activity) => {
                  const getColor = (colorName: string) => {
                    const colorMap: any = {
                      success: COLORS.success,
                      warning: COLORS.warning,
                      info: COLORS.info,
                      error: COLORS.error,
                      primary: COLORS.primary,
                    };
                    return colorMap[colorName] || COLORS.info;
                  };

                  return (
                    <View key={activity.id} style={styles.activityItem}>
                      <View style={[
                        styles.activityIcon,
                        { backgroundColor: `${getColor(activity.color)}15` }
                      ]}>
                        <MaterialCommunityIcons
                          name={activity.icon as any}
                          size={20}
                          color={getColor(activity.color)}
                        />
                      </View>
                      <View style={styles.activityText}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                      {activity.amount && (
                        <Text style={styles.activityAmount}>
                          ₺{activity.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Text>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="history" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyStateText}>Henüz aktivite yok</Text>
                </View>
              )}
            </View>
          </Card>
        </View>
      </View>

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
      ? { boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }
      : { elevation: 2 }) as any,
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
  statSecondary: {
    backgroundColor: '#6366f1',
  },
  statDark: {
    backgroundColor: '#475569',
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
      ? { boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
      : { elevation: 1 }) as any,
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

  // Ciro Takibi Stilleri
  profitContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: SPACING.md,
  },
  profitCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profitPeriod: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  profitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  profitLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  profitValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  profitTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  profitTotalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  profitTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  profitMargin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}50`,
  },
  profitMarginLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  profitMarginValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.info,
  },

  // Yan Yana Layout Stilleri
  sideBySideContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sideBySideCard: {
    flex: 1,
  },

  // Empty State Stilleri
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
