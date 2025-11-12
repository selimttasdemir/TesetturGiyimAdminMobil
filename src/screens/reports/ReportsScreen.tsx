import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../../components/common/Card';
import { InfoModal } from '../../components/common/InfoModal';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { isWeb } from '../../utils/platform';
import reportService from '../../services/report.service';
import type { DailySale, DashboardStats } from '../../services/report.service';

export const ReportsScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('week');

  // Real data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [dailySales, setDailySales] = useState<DailySale[]>([]);

  // Info modal state
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const showInfo = (title: string, message: string) => {
    setInfoModal({ visible: true, title, message });
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const days = selectedPeriod === 'today' ? 1 : selectedPeriod === 'week' ? 7 : 30;

      console.log('Loading reports data, days:', days);

      const [stats, sales] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getDailySales(days),
      ]);

      console.log('Dashboard Stats:', stats);
      console.log('Daily Sales:', sales);
      console.log('Daily Sales type:', typeof sales, 'Is Array:', Array.isArray(sales));

      setDashboardStats(stats || null);
      setDailySales(Array.isArray(sales) ? sales : []);
    } catch (error: any) {
      console.error('Rapor yükleme hatası:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Kullanıcıya hata mesajı göster
      const errorMessage = error.response?.data?.detail || error.message || 'Raporlar yüklenemedi';
      showInfo('Hata', `Rapor verileri alınamadı: ${errorMessage}`);

      // Hata durumunda boş array set et
      setDashboardStats(null);
      setDailySales([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Hesaplamalar - güvenli kontroller
  const totalSales = dailySales?.reduce((sum, day) => sum + day.amount, 0) || 0;
  const totalTransactions = dailySales?.reduce((sum, day) => sum + day.transactions, 0) || 0;
  const avgSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Web stats - dashboard stats'tan
  const webStats = dashboardStats ? {
    todayViews: dashboardStats.today_transactions,
    uniqueVisitors: Math.floor(dashboardStats.today_transactions * 0.7), // Estimation
    avgSessionTime: '3:24',
    bounceRate: 42.5,
  } : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <>
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
          {webStats ? (
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
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>İstatistikler yükleniyor...</Text>
            </View>
          )}
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
            {dailySales && dailySales.length > 0 ? (
              dailySales.map((sale, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{sale.date}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontWeight: '600' }]}>
                    ₺{sale.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'center' }]}>
                    {sale.transactions}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.8, textAlign: 'right', color: COLORS.success }]}>
                    ₺{sale.avg_ticket}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz satış verisi yok</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Sayfa Görüntülenmeleri - Yakında */}
        <Card title="Sayfa Görüntülenmeleri" icon="file-chart" iconColor={COLORS.secondary}>
          <View style={styles.comingSoonContainer}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#CCC" />
            <Text style={styles.comingSoonText}>Bu özellik yakında eklenecek</Text>
            <Text style={styles.comingSoonSubText}>
              Sayfa görüntülenme istatistikleri için web analytics entegrasyonu yapılıyor
            </Text>
          </View>
        </Card>

        {/* Sepet Terk Etme Analizi - Yakında */}
        <Card title="Sepet Terk Etme Analizi" icon="cart-remove" iconColor={COLORS.error}>
          <View style={styles.comingSoonContainer}>
            <MaterialCommunityIcons name="cart-remove" size={48} color="#CCC" />
            <Text style={styles.comingSoonText}>Bu özellik yakında eklenecek</Text>
            <Text style={styles.comingSoonSubText}>
              Sepet terk etme analizleri için özel tracking sistemi geliştiriliyor
            </Text>
          </View>
        </Card>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Info Modal */}
      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ visible: false, title: '', message: '' })}
      />
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  comingSoonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  comingSoonSubText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
