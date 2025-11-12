import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Platform,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSaleStore } from '../../store/saleStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { Sale, PaymentMethod } from '../../types';
import { useResponsiveGrid } from '../../hooks/useResponsiveGrid';

const { width } = Dimensions.get('window');
const isMobile = Platform.OS !== 'web' || width < 768;

export const SalesListScreen = ({ navigation }: any) => {
    const { sales, fetchSales, isLoading } = useSaleStore();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<string>('all');
    const [allSales, setAllSales] = useState<Sale[]>([]); // Tüm satışları sakla
    
    // Responsive grid - 2 sütun için optimize (min 350px kart genişliği, 200px yükseklik)
    const gridConfig = useResponsiveGrid(350, 210);

    useEffect(() => {
        loadSales();
    }, [filter]);

    const loadSales = async () => {
        const filters: any = {};
        if (filter !== 'all') {
            filters.payment_method = filter; // Backend snake_case kullanıyor
        }
        await fetchSales(filters);
    };

    // sales değiştiğinde allSales'i güncelle (sadece "Tümü" filtresi için)
    useEffect(() => {
        if (filter === 'all' && sales.length > 0) {
            setAllSales(sales);
        }
    }, [sales, filter]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadSales();
        setRefreshing(false);
    };

    // Ödeme türlerine göre toplam hesaplama - TÜM satışlardan hesapla
    const calculatePaymentTotals = () => {
        const totals = {
            nakit: 0,
            kart: 0,
            veresiye: 0,
            veresiyeOdenen: 0,
            veresiyeKalan: 0,
            total: 0,
        };

        // Eğer "Tümü" seçiliyse sales'i kullan, değilse allSales'i kullan
        const salesForCalculation = filter === 'all' ? sales : allSales;

        console.log('Filter:', filter);
        console.log('Sales count:', sales.length);
        console.log('AllSales count:', allSales.length);
        console.log('Using for calculation:', salesForCalculation.length);

        salesForCalculation.forEach((sale) => {
            const amount = (sale.finalAmount || sale.final_amount || 0) as number;
            const paymentMethod = sale.paymentMethod || sale.payment_method; // Snake_case desteği
            console.log(`Sale ${sale.id}: ${paymentMethod} - ${amount}`);
            totals.total += amount;

            if (paymentMethod === 'nakit') {
                totals.nakit += amount;
            } else if (paymentMethod === 'kart') {
                totals.kart += amount;
            } else if (paymentMethod === 'veresiye') {
                totals.veresiye += amount;
                totals.veresiyeOdenen += (sale.paidAmount || sale.paid_amount || 0) as number;
                totals.veresiyeKalan += (sale.remainingAmount || sale.remaining_amount || 0) as number;
            }
        });

        console.log('Totals:', totals);
        return totals;
    };

    const paymentTotals = calculatePaymentTotals();

    const getPaymentIcon = (method: string) => {
        switch (method) {
            case PaymentMethod.CASH:
            case 'nakit':
                return 'cash';
            case PaymentMethod.CARD:
            case 'kart':
                return 'credit-card';
            case PaymentMethod.CREDIT:
            case 'veresiye':
                return 'calendar-clock';
            default:
                return 'help-circle';
        }
    };

    const getPaymentColor = (method: string) => {
        switch (method) {
            case PaymentMethod.CASH:
            case 'nakit':
                return COLORS.success;
            case PaymentMethod.CARD:
            case 'kart':
                return COLORS.primary;
            case PaymentMethod.CREDIT:
            case 'veresiye':
                return COLORS.warning;
            default:
                return COLORS.textSecondary;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderSaleCard = ({ item }: { item: Sale }) => {
        const paymentMethod = item.paymentMethod || item.payment_method; // Snake_case desteği
        return (
            <View style={[styles.gridItem, { width: gridConfig.itemWidth }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('SaleDetail', { saleId: item.id })}
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                >
                    <Card style={[styles.saleCard, { minHeight: gridConfig.cardHeight }] as any}>
                        <View style={styles.saleHeader}>
                            <View style={styles.saleNumberContainer}>
                                <MaterialCommunityIcons name="receipt" size={20} color={COLORS.primary} />
                                <Text style={styles.saleNumber}>{item.saleNumber || `#${item.id}`}</Text>
                        </View>
                        <View style={[styles.paymentBadge, { backgroundColor: `${getPaymentColor(paymentMethod)}20` }]}>
                            <MaterialCommunityIcons
                                name={getPaymentIcon(paymentMethod)}
                                size={16}
                                color={getPaymentColor(paymentMethod)}
                            />
                            <Text style={[styles.paymentText, { color: getPaymentColor(paymentMethod) }]}>
                                {paymentMethod === 'nakit' ? 'Nakit' :
                                    paymentMethod === 'kart' ? 'Kart' :
                                        paymentMethod === 'veresiye' ? 'Veresiye' : paymentMethod}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.saleDetails}>
                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
                        </View>

                        {item.customer && (
                            <View style={styles.detailRow}>
                                <MaterialCommunityIcons name="account" size={16} color={COLORS.textSecondary} />
                                <Text style={styles.detailText}>{item.customer.name}</Text>
                            </View>
                        )}

                        <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="package-variant" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.detailText} numberOfLines={1}>
                                {item.items && item.items.length > 0
                                    ? item.items.map(i => i.product?.name || 'Ürün').join(', ')
                                    : `${item.items?.length || 0} ürün`}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.saleFooter}>
                        <View>
                            <Text style={styles.totalLabel}>Toplam</Text>
                            <Text style={styles.totalAmount}>
                                ₺{((item.finalAmount || item.final_amount || 0) as number).toLocaleString('tr-TR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </Text>
                        </View>

                        {(item.paymentMethod || item.payment_method) === 'veresiye' && (item.remainingAmount || item.remaining_amount || 0) > 0 && (
                            <View style={styles.debtBadge}>
                                <Text style={styles.debtText}>
                                    Kalan: ₺{((item.remainingAmount || item.remaining_amount || 0) as number).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>
                </Card>
            </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Satış Geçmişi</Text>
                    <Button
                        title="Yeni Satış"
                        onPress={() => navigation.navigate('NewSale')}
                        icon="plus"
                        style={styles.newButton}
                    />
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    {['all', 'nakit', 'kart', 'veresiye'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f === 'all' ? 'Tümü' :
                                    f === 'nakit' ? 'Nakit' :
                                        f === 'kart' ? 'Kart' : 'Veresiye'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Total Summary */}
                {filter === 'all' && sales.length > 0 && (
                    <View style={styles.totalSummaryContainer}>
                        <Card style={styles.totalSummaryCard}>
                            <View style={styles.totalSummaryContent}>
                                <View style={styles.totalSummaryLeft}>
                                    <Text style={styles.totalSummaryLabel}>Toplam Satış</Text>
                                    <Text style={styles.totalSummaryCount}>{sales.length} Satış</Text>
                                </View>
                                <View style={styles.totalSummaryRight}>
                                    <Text style={styles.totalSummaryAmount}>
                                        ₺{paymentTotals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    </View>
                )}

                {/* Payment Summary Cards */}
                {filter === 'all' ? (
                    <View style={styles.summaryContainer}>
                        <Card style={styles.summaryCard}>
                            <View style={styles.cashCardBg}>
                                <View style={styles.summaryIconContainer}>
                                    <MaterialCommunityIcons name="cash" size={24} color={COLORS.success} />
                                </View>
                                <Text style={styles.summaryLabel}>Nakit</Text>
                                <Text style={[styles.summaryAmount, { color: COLORS.success }]}>
                                    ₺{paymentTotals.nakit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </Card>

                        <Card style={styles.summaryCard}>
                            <View style={styles.cardCardBg}>
                                <View style={styles.summaryIconContainer}>
                                    <MaterialCommunityIcons name="credit-card" size={24} color={COLORS.primary} />
                                </View>
                                <Text style={styles.summaryLabel}>Kart</Text>
                                <Text style={[styles.summaryAmount, { color: COLORS.primary }]}>
                                    ₺{paymentTotals.kart.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </Text>
                            </View>
                        </Card>

                        <Card style={styles.summaryCard}>
                            <View style={styles.creditCardBg}>
                                <View style={styles.summaryIconContainer}>
                                    <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.warning} />
                                </View>
                                <Text style={styles.summaryLabel}>Veresiye</Text>
                                <Text style={[styles.summaryAmount, { color: COLORS.warning }]}>
                                    ₺{paymentTotals.veresiye.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </Text>
                                {paymentTotals.veresiyeKalan > 0 && (
                                    <Text style={styles.summarySubtext}>
                                        Kalan: ₺{paymentTotals.veresiyeKalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </Text>
                                )}
                            </View>
                        </Card>
                    </View>
                ) : (
                    <View style={styles.singleSummaryContainer}>
                        <Card style={styles.singleSummaryCard}>
                            <View style={filter === 'nakit' ? styles.cashCardBg :
                                filter === 'kart' ? styles.cardCardBg :
                                    styles.creditCardBg}>
                                <View style={styles.summaryIconContainer}>
                                    <MaterialCommunityIcons
                                        name={filter === 'nakit' ? 'cash' :
                                            filter === 'kart' ? 'credit-card' :
                                                'calendar-clock'}
                                        size={32}
                                        color={filter === 'nakit' ? COLORS.success :
                                            filter === 'kart' ? COLORS.primary :
                                                COLORS.warning}
                                    />
                                </View>
                                <Text style={styles.singleSummaryLabel}>
                                    {filter === 'nakit' ? 'Nakit Ödemeler' :
                                        filter === 'kart' ? 'Kart Ödemeleri' :
                                            'Veresiye Satışlar'}
                                </Text>
                                <Text style={styles.singleSummaryCount}>{sales.length} Satış</Text>
                                <Text style={[styles.singleSummaryAmount, {
                                    color: filter === 'nakit' ? COLORS.success :
                                        filter === 'kart' ? COLORS.primary :
                                            COLORS.warning
                                }]}>
                                    ₺{(filter === 'nakit' ? paymentTotals.nakit :
                                        filter === 'kart' ? paymentTotals.kart :
                                            paymentTotals.veresiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </Text>
                                {filter === 'veresiye' && paymentTotals.veresiyeKalan > 0 && (
                                    <>
                                        <View style={styles.singleSummaryDivider} />
                                        <Text style={styles.singleSummaryDebtLabel}>Toplam Kalan Borç</Text>
                                        <Text style={styles.singleSummaryDebt}>
                                            ₺{paymentTotals.veresiyeKalan.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </Card>
                    </View>
                )}

                {/* Sales List */}
                <FlatList
                    data={sales}
                    renderItem={renderSaleCard}
                    keyExtractor={(item) => item.id}
                    key={`grid-${gridConfig.numColumns}`}
                    numColumns={gridConfig.numColumns}
                    columnWrapperStyle={gridConfig.numColumns > 1 ? [styles.gridRow, { gap: gridConfig.itemSpacing }] : undefined}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="receipt" size={64} color={COLORS.textSecondary} />
                            <Text style={styles.emptyText}>Henüz satış kaydı yok</Text>
                            <Button
                                title="İlk Satışı Yap"
                                onPress={() => navigation.navigate('NewSale')}
                                variant="outline"
                                style={styles.emptyButton}
                            />
                        </View>
                    }
                />
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: SPACING.md,
            backgroundColor: COLORS.surface,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
        },
        title: {
            fontSize: FONT_SIZES.xl,
            fontWeight: 'bold',
            color: COLORS.text,
        },
        newButton: {
            paddingHorizontal: SPACING.md,
        },
        filterContainer: {
            flexDirection: 'row',
            padding: SPACING.md,
            backgroundColor: COLORS.surface,
        },
        filterButton: {
            flex: 1,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            backgroundColor: COLORS.background,
            marginRight: SPACING.sm,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
        },
        filterButtonActive: {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primary,
        },
        filterText: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.textSecondary,
            fontWeight: '500',
        },
        filterTextActive: {
            color: COLORS.surface,
            fontWeight: '700',
        },
        totalSummaryContainer: {
            paddingHorizontal: SPACING.md,
            paddingBottom: SPACING.sm,
        },
        totalSummaryCard: {
            backgroundColor: COLORS.primary,
        },
        totalSummaryContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        totalSummaryLeft: {
            flex: 1,
        },
        totalSummaryLabel: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.surface,
            marginBottom: 4,
        },
        totalSummaryCount: {
            fontSize: FONT_SIZES.md,
            color: COLORS.surface,
            opacity: 0.9,
        },
        totalSummaryRight: {
            alignItems: 'flex-end',
        },
        totalSummaryAmount: {
            fontSize: FONT_SIZES.xxl,
            fontWeight: 'bold',
            color: COLORS.surface,
        },
        summaryContainer: {
            flexDirection: 'row',
            padding: SPACING.md,
            paddingTop: 0,
            gap: SPACING.sm,
        },
        summaryCard: {
            flex: 1,
            padding: 0,
            overflow: 'hidden',
        },
        cashCardBg: {
            backgroundColor: `${COLORS.success}10`,
            alignItems: 'center',
            padding: SPACING.md,
            height: '100%',
        },
        cardCardBg: {
            backgroundColor: `${COLORS.primary}10`,
            alignItems: 'center',
            padding: SPACING.md,
            height: '100%',
        },
        creditCardBg: {
            backgroundColor: `${COLORS.warning}10`,
            alignItems: 'center',
            padding: SPACING.md,
            height: '100%',
        },
        summaryIconContainer: {
            marginBottom: SPACING.xs,
        },
        summaryLabel: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.textSecondary,
            marginBottom: 4,
        },
        summaryAmount: {
            fontSize: FONT_SIZES.lg,
            fontWeight: 'bold',
        },
        summarySubtext: {
            fontSize: FONT_SIZES.xs,
            color: COLORS.error,
            marginTop: 4,
        },
        singleSummaryContainer: {
            padding: SPACING.md,
            paddingTop: 0,
        },
        singleSummaryCard: {
            padding: 0,
            overflow: 'hidden',
        },
        singleSummaryLabel: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '600',
            marginBottom: SPACING.xs,
            textAlign: 'center',
        },
        singleSummaryCount: {
            fontSize: FONT_SIZES.md,
            color: COLORS.textSecondary,
            marginBottom: SPACING.sm,
            textAlign: 'center',
        },
        singleSummaryAmount: {
            fontSize: 32,
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: SPACING.xs,
        },
        singleSummaryDivider: {
            height: 1,
            backgroundColor: COLORS.border,
            marginVertical: SPACING.md,
            marginHorizontal: SPACING.lg,
        },
        singleSummaryDebtLabel: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.textSecondary,
            marginBottom: 4,
            textAlign: 'center',
        },
        singleSummaryDebt: {
            fontSize: FONT_SIZES.xl,
            fontWeight: 'bold',
            color: COLORS.error,
            textAlign: 'center',
        },
        list: {
            padding: SPACING.md,
        },
        gridRow: {
            justifyContent: 'flex-start',
            marginBottom: 0,
        },
        gridItem: {
            marginBottom: 16,
        },
        saleCard: {
            marginBottom: 0,
            flex: 1,
        },
        saleHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.md,
        },
        saleNumberContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
        },
        saleNumber: {
            fontSize: FONT_SIZES.lg,
            fontWeight: '700',
            color: COLORS.text,
        },
        paymentBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: SPACING.sm,
            borderRadius: BORDER_RADIUS.sm,
            gap: 4,
        },
        paymentText: {
            fontSize: FONT_SIZES.xs,
            fontWeight: '600',
        },
        saleDetails: {
            gap: SPACING.xs,
            marginBottom: SPACING.md,
        },
        detailRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.xs,
        },
        detailText: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.textSecondary,
        },
        saleFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: SPACING.md,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
        },
        totalLabel: {
            fontSize: FONT_SIZES.sm,
            color: COLORS.textSecondary,
            marginBottom: 4,
        },
        totalAmount: {
            fontSize: FONT_SIZES.xl,
            fontWeight: 'bold',
            color: COLORS.primary,
        },
        debtBadge: {
            backgroundColor: `${COLORS.error}20`,
            paddingVertical: 4,
            paddingHorizontal: SPACING.sm,
            borderRadius: BORDER_RADIUS.sm,
        },
        debtText: {
            fontSize: FONT_SIZES.sm,
            fontWeight: '600',
            color: COLORS.error,
        },
        emptyState: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: SPACING.xxl,
            marginTop: 100,
        },
        emptyText: {
            fontSize: FONT_SIZES.lg,
            color: COLORS.textSecondary,
            marginVertical: SPACING.lg,
        },
        emptyButton: {
            marginTop: SPACING.md,
        },
    });