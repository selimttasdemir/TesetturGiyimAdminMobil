import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { ResponsiveContainer, Grid } from '../../components/layout';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useSaleStore } from '../../store/saleStore';
import { responsive, isWeb, isMobileSize } from '../../utils/platform';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { fetchSales } = useSaleStore();
  
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProducts({ pageSize: 5 }),
        fetchSales({ pageSize: 10 }),
      ]);
    } catch (error) {
      // Error handling
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Mock data - Giyim mağazası için
  const stats = {
    todaySales: 8420,
    todayTransactions: 23,
    lowStockItems: 3,
    totalProducts: products.length || 147,
    monthlyRevenue: 125340,
    monthlyGrowth: 12.5,
  };

  const quickActions = [
    { id: 1, title: 'Hızlı Satış', icon: 'cart-plus', color: COLORS.primary, screen: 'Sales' },
    { id: 2, title: 'Ürün Ekle', icon: 'hanger', color: COLORS.secondary, screen: 'Products' },
    { id: 3, title: 'Barkod Tara', icon: 'barcode-scan', color: COLORS.accent, screen: 'Products' },
    { id: 4, title: 'Raporlar', icon: 'chart-line', color: COLORS.info, screen: 'Reports' },
  ];

  const statsData = [
    {
      id: 1,
      label: 'Bugünkü Satış',
      value: `₺${stats.todaySales.toLocaleString()}`,
      icon: 'cash-multiple',
      color: COLORS.primary,
      trend: '+8.2%',
    },
    {
      id: 2,
      label: 'İşlem Sayısı',
      value: stats.todayTransactions.toString(),
      icon: 'receipt',
      color: COLORS.success,
      trend: '+12.5%',
    },
    {
      id: 3,
      label: 'Düşük Stok',
      value: stats.lowStockItems.toString(),
      icon: 'alert',
      color: COLORS.warning,
      trend: null,
    },
    {
      id: 4,
      label: 'Toplam Ürün',
      value: stats.totalProducts.toString(),
      icon: 'hanger',
      color: COLORS.info,
      trend: '+15',
    },
  ];

  const renderStatCard = (stat: typeof statsData[0]) => (
    <View style={[styles.statCard, { backgroundColor: stat.color }]} key={stat.id}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons 
          name={stat.icon as any} 
          size={responsive({ mobile: 28, tablet: 32, desktop: 36, default: 28 })} 
          color={COLORS.surface} 
        />
        {stat.trend && (
          <View style={styles.trendBadge}>
            <Text style={styles.trendText}>{stat.trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
  );

  return (
    <ResponsiveContainer
      scrollable={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hoş Geldiniz,</Text>
          <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
          <Text style={styles.storeName}>Tesettür Giyim Admin Panel</Text>
        </View>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons 
            name="store" 
            size={responsive({ mobile: 32, tablet: 40, desktop: 48, default: 32 })} 
            color={COLORS.primary} 
          />
        </View>
      </View>

      {/* Stats Grid - Responsive */}
      <Grid 
        columns={{ mobile: 2, tablet: 4, desktop: 4 }}
        gap={SPACING.md}
        style={styles.statsGrid}
      >
        {statsData.map(renderStatCard)}
      </Grid>

      {/* Quick Actions */}
      <Card title="Hızlı İşlemler" icon="lightning-bolt" iconColor={COLORS.primary}>
        <Grid 
          columns={{ mobile: 2, tablet: 4, desktop: 4 }}
          gap={SPACING.md}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                <MaterialCommunityIcons 
                  name={action.icon as any} 
                  size={responsive({ mobile: 24, tablet: 28, desktop: 32, default: 24 })} 
                  color={action.color} 
                />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </Grid>
      </Card>

      {/* Recent Activity and Low Stock - Side by Side on Web */}
      <Grid columns={{ mobile: 1, tablet: 2, desktop: 2 }} gap={SPACING.md}>
        {/* Recent Activity */}
        <Card title="Son Aktiviteler" icon="history" iconColor={COLORS.primary}>
          <View style={styles.activityList}>
            <ActivityItem 
              icon="cart-check"
              iconColor={COLORS.success}
              title="Ferace satışı tamamlandı"
              time="5 dakika önce"
              amount="₺450"
            />
            <ActivityItem 
              icon="alert"
              iconColor={COLORS.warning}
              title="Şal stoğu azaldı"
              time="15 dakika önce"
            />
            <ActivityItem 
              icon="hanger"
              iconColor={COLORS.info}
              title="Yeni tunik eklendi"
              time="1 saat önce"
            />
            <ActivityItem 
              icon="package-variant"
              iconColor={COLORS.secondary}
              title="Tedarik siparişi alındı"
              time="2 saat önce"
            />
          </View>
        </Card>

        {/* Low Stock Items */}
        <Card title="Düşük Stok Uyarıları" icon="alert-circle" iconColor={COLORS.warning}>
          <View style={styles.stockList}>
            <StockItem 
              name="Şal - Siyah"
              stock={3}
              minStock={10}
              category="Eşarp"
            />
            <StockItem 
              name="Ferace - Lacivert"
              stock={5}
              minStock={15}
              category="Ferace"
            />
            <StockItem 
              name="Bone - Bej"
              stock={2}
              minStock={8}
              category="Bone"
            />
          </View>
        </Card>
      </Grid>

      {/* Monthly Overview - Web only */}
      {!isMobileSize && (
        <Card title="Aylık Özet" icon="chart-bar" iconColor={COLORS.info}>
          <Grid columns={3} gap={SPACING.lg}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Toplam Gelir</Text>
              <Text style={styles.overviewValue}>₺{stats.monthlyRevenue.toLocaleString()}</Text>
              <Text style={styles.overviewTrend}>+{stats.monthlyGrowth}% bu ay</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Ortalama Sepet</Text>
              <Text style={styles.overviewValue}>₺{(stats.monthlyRevenue / 85).toFixed(0)}</Text>
              <Text style={styles.overviewTrend}>+5.2% geçen aya göre</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>En Çok Satan</Text>
              <Text style={styles.overviewValue}>Ferace</Text>
              <Text style={styles.overviewTrend}>42 adet satıldı</Text>
            </View>
          </Grid>
        </Card>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: SPACING.xxl }} />
    </ResponsiveContainer>
  );
};

// Helper Components
const ActivityItem: React.FC<{
  icon: string;
  iconColor: string;
  title: string;
  time: string;
  amount?: string;
}> = ({ icon, iconColor, title, time, amount }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: `${iconColor}15` }]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={iconColor} />
    </View>
    <View style={styles.activityText}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
    {amount && <Text style={styles.activityAmount}>{amount}</Text>}
  </View>
);

const StockItem: React.FC<{
  name: string;
  stock: number;
  minStock: number;
  category: string;
}> = ({ name, stock, minStock, category }) => (
  <View style={styles.stockItem}>
    <View style={styles.stockInfo}>
      <Text style={styles.stockName}>{name}</Text>
      <Text style={styles.stockCategory}>{category}</Text>
    </View>
    <View style={styles.stockQuantity}>
      <Text style={styles.stockCurrent}>{stock}</Text>
      <Text style={styles.stockMin}>/ {minStock}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive({ mobile: SPACING.lg, tablet: SPACING.xl, desktop: SPACING.xxl, default: SPACING.lg }),
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: responsive({ mobile: FONT_SIZES.sm, tablet: FONT_SIZES.md, desktop: FONT_SIZES.lg, default: FONT_SIZES.sm }),
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: responsive({ mobile: FONT_SIZES.xl, tablet: FONT_SIZES.xxl, desktop: FONT_SIZES.xxxl, default: FONT_SIZES.xl }),
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeName: {
    fontSize: responsive({ mobile: FONT_SIZES.sm, tablet: FONT_SIZES.md, desktop: FONT_SIZES.lg, default: FONT_SIZES.sm }),
    color: COLORS.primary,
    fontWeight: '600',
  },
  avatarContainer: {
    width: responsive({ mobile: 48, tablet: 56, desktop: 64, default: 48 }),
    height: responsive({ mobile: 48, tablet: 56, desktop: 64, default: 48 }),
    borderRadius: responsive({ mobile: 24, tablet: 28, desktop: 32, default: 24 }),
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    marginBottom: SPACING.lg,
  },
  statCard: {
    padding: responsive({ mobile: SPACING.md, tablet: SPACING.lg, desktop: SPACING.xl, default: SPACING.md }),
    borderRadius: BORDER_RADIUS.lg,
    minHeight: responsive({ mobile: 120, tablet: 140, desktop: 160, default: 120 }),
    justifyContent: 'space-between',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' } as any)
      : {
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }),
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: responsive({ mobile: FONT_SIZES.xl, tablet: FONT_SIZES.xxl, desktop: 28, default: FONT_SIZES.xl }),
    fontWeight: 'bold',
    color: COLORS.surface,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: responsive({ mobile: FONT_SIZES.xs, tablet: FONT_SIZES.sm, desktop: FONT_SIZES.md, default: FONT_SIZES.xs }),
    color: COLORS.surface,
    opacity: 0.9,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionIcon: {
    width: responsive({ mobile: 56, tablet: 64, desktop: 72, default: 56 }),
    height: responsive({ mobile: 56, tablet: 64, desktop: 72, default: 56 }),
    borderRadius: responsive({ mobile: 28, tablet: 32, desktop: 36, default: 28 }),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: responsive({ mobile: FONT_SIZES.xs, tablet: FONT_SIZES.sm, desktop: FONT_SIZES.md, default: FONT_SIZES.xs }),
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
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
  stockList: {
    gap: SPACING.md,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  stockCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  stockQuantity: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockCurrent: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  stockMin: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  overviewItem: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  overviewLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  overviewValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  overviewTrend: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
});
