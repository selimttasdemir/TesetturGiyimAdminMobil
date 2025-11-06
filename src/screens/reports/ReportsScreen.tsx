import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { isWeb, responsive } from '../../utils/platform';

const { width } = Dimensions.get('window');

interface DailySale {
  date: string;
  amount: number;
  transactions: number;
  avgTicket: number;
}

interface PageView {
  page: string;
  views: number;
  uniqueVisitors: number;
  bounceRate: number;
}

interface AbandonmentData {
  page: string;
  count: number;
  percentage: number;
}

export const ReportsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data fetch
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Mock Data - Günlük Satışlar
  const dailySales: DailySale[] = [
    { date: '26 Ekim', amount: 8420, transactions: 23, avgTicket: 366 },
    { date: '25 Ekim', amount: 12350, transactions: 31, avgTicket: 398 },
    { date: '24 Ekim', amount: 9870, transactions: 27, avgTicket: 365 },
    { date: '23 Ekim', amount: 15240, transactions: 38, avgTicket: 401 },
    { date: '22 Ekim', amount: 11200, transactions: 29, avgTicket: 386 },
  ];

  // Mock Data - Web Sitesi Görüntülenmeleri
  const webStats = {
    todayViews: 1247,
    uniqueVisitors: 892,
    avgSessionTime: '3:24',
    bounceRate: 42.5,
  };

  // Mock Data - Sayfa Görüntülenmeleri
  const pageViews: PageView[] = [
    { page: 'Ana Sayfa', views: 456, uniqueVisitors: 324, bounceRate: 35.2 },
    { page: 'Ürünler', views: 389, uniqueVisitors: 276, bounceRate: 28.5 },
    { page: 'Ferace', views: 234, uniqueVisitors: 198, bounceRate: 31.8 },
    { page: 'Şal & Eşarp', views: 167, uniqueVisitors: 142, bounceRate: 44.1 },
    { page: 'İletişim', views: 98, uniqueVisitors: 87, bounceRate: 52.3 },
  ];

  // Mock Data - Alışveriş Sepeti Terk Etme
  const abandonmentData: AbandonmentData[] = [
    { page: 'Ödeme Sayfası', count: 34, percentage: 42.5 },
    { page: 'Sepet', count: 28, percentage: 35.0 },
    { page: 'Kargo Bilgileri', count: 12, percentage: 15.0 },
    { page: 'Ürün Detay', count: 6, percentage: 7.5 },
  ];

  const totalSales = dailySales.reduce((sum, day) => sum + day.amount, 0);
  const totalTransactions = dailySales.reduce((sum, day) => sum + day.transactions, 0);
  const avgSale = totalSales / totalTransactions;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('today')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'today' && styles.periodTextActive]}>
            Bugün
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
            Bu Hafta
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('month')}
        >
          <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
            Bu Ay
          </Text>
        </TouchableOpacity>
      </View>

      {/* Web Sitesi İstatistikleri */}
      <Card title="Web Sitesi İstatistikleri" icon="web" iconColor={COLORS.info}>
        <View style={styles.webStatsGrid}>
          <View style={styles.webStatItem}>
            <MaterialCommunityIcons name="eye" size={24} color={COLORS.primary} />
            <Text style={styles.webStatValue}>{webStats.todayViews.toLocaleString()}</Text>
            <Text style={styles.webStatLabel}>Görüntülenme</Text>
          </View>
          <View style={styles.webStatItem}>
            <MaterialCommunityIcons name="account-group" size={24} color={COLORS.success} />
            <Text style={styles.webStatValue}>{webStats.uniqueVisitors.toLocaleString()}</Text>
            <Text style={styles.webStatLabel}>Ziyaretçi</Text>
          </View>
          <View style={styles.webStatItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.secondary} />
            <Text style={styles.webStatValue}>{webStats.avgSessionTime}</Text>
            <Text style={styles.webStatLabel}>Ort. Süre</Text>
          </View>
          <View style={styles.webStatItem}>
            <MaterialCommunityIcons name="exit-run" size={24} color={COLORS.warning} />
            <Text style={styles.webStatValue}>%{webStats.bounceRate}</Text>
            <Text style={styles.webStatLabel}>Çıkma Oranı</Text>
          </View>
        </View>
      </Card>

      {/* Günlük Satış Raporu */}
      <Card title="Günlük Satış Raporu" icon="chart-line" iconColor={COLORS.primary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Toplam Satış</Text>
            <Text style={styles.summaryValue}>₺{totalSales.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>İşlem Sayısı</Text>
            <Text style={styles.summaryValue}>{totalTransactions}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ort. Sepet</Text>
            <Text style={styles.summaryValue}>₺{Math.round(avgSale)}</Text>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>Tarih</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Satış</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>İşlem</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Ort.</Text>
          </View>
          {dailySales.map((sale, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1 }]}>{sale.date}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                ₺{sale.amount.toLocaleString()}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>
                {sale.transactions}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right', color: COLORS.success }]}>
                ₺{sale.avgTicket}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Sayfa Görüntülenmeleri */}
      <Card title="Sayfa Görüntülenmeleri" icon="file-chart" iconColor={COLORS.secondary}>
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Sayfa</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Görüntülenme</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'center' }]}>Ziyaretçi</Text>
            <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Çıkma %</Text>
          </View>
          {pageViews.map((page, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '500' }]}>{page.page}</Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>
                {page.views}
              </Text>
              <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>
                {page.uniqueVisitors}
              </Text>
              <Text style={[
                styles.tableCell, 
                { 
                  flex: 0.8, 
                  textAlign: 'right',
                  color: page.bounceRate > 45 ? COLORS.error : COLORS.success 
                }
              ]}>
                {page.bounceRate}%
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Sepet Terk Etme Analizi */}
      <Card title="Sepet Terk Etme Analizi" icon="cart-remove" iconColor={COLORS.error}>
        <View style={styles.abandonmentHeader}>
          <MaterialCommunityIcons name="information" size={20} color={COLORS.info} />
          <Text style={styles.abandonmentInfo}>
            Müşterilerin hangi sayfadan alışverişi terk ettiği
          </Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Sayfa</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Sayı</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Oran</Text>
          </View>
          {abandonmentData.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.tableCell, { fontWeight: '500' }]}>{item.page}</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${item.percentage}%`,
                        backgroundColor: item.percentage > 35 ? COLORS.error : COLORS.warning 
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: '600' }]}>
                {item.count}
              </Text>
              <Text style={[
                styles.tableCell, 
                { 
                  flex: 1, 
                  textAlign: 'right',
                  fontWeight: '600',
                  color: item.percentage > 35 ? COLORS.error : COLORS.warning
                }
              ]}>
                %{item.percentage}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalAbandonment}>
          <Text style={styles.totalAbandonmentLabel}>Toplam Terk Edilen Sepet:</Text>
          <Text style={styles.totalAbandonmentValue}>
            {abandonmentData.reduce((sum, item) => sum + item.count, 0)} adet
          </Text>
        </View>
      </Card>

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
  periodSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.surface,
  },
  webStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  webStatItem: {
    flex: 1,
    minWidth: isWeb ? 150 : '45%',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  webStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  webStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tableContainer: {
    marginTop: SPACING.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableCell: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  abandonmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.info}15`,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  abandonmentInfo: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  totalAbandonment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: `${COLORS.error}10`,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.error}30`,
  },
  totalAbandonmentLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  totalAbandonmentValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.error,
  },
});
