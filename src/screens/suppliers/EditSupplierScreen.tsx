import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSupplierStore } from '../../store/supplierStore';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';

type SupplierStackParamList = {
  EditSupplier: { supplierId: string };
};

type EditSupplierScreenRouteProp = RouteProp<SupplierStackParamList, 'EditSupplier'>;

export const EditSupplierScreen = ({ navigation }: any) => {
  const route = useRoute<EditSupplierScreenRouteProp>();
  const { supplierId } = route.params;
  const { suppliers, updateSupplier, fetchSuppliers, isLoading } = useSupplierStore();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplier();
  }, [supplierId]);

  const loadSupplier = async () => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setName(supplier.name);
      setContactPerson(supplier.contactPerson || '');
      setPhone(supplier.phone);
      setEmail(supplier.email || '');
      setAddress(supplier.address || '');
      setTaxNumber(supplier.taxNumber || '');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      Alert.alert('Hata', 'Lütfen firma adı ve telefon numarası girin');
      return;
    }

    const supplierData = {
      name,
      contact_person: contactPerson || undefined,
      phone,
      email: email || undefined,
      address: address || undefined,
      tax_number: taxNumber || undefined,
    };

    const success = await updateSupplier(supplierId, supplierData);
    
    if (success) {
      await fetchSuppliers();
      Alert.alert('Başarılı', 'Tedarikçi güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Hata', 'Tedarikçi güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
          
          <Input
            label="Firma Adı *"
            value={name}
            onChangeText={setName}
            placeholder="ABC Tekstil Ltd. Şti."
          />

          <Input
            label="Yetkili Kişi"
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="Ahmet Yılmaz"
          />

          <Input
            label="Telefon *"
            value={phone}
            onChangeText={setPhone}
            placeholder="0532 123 45 67"
            keyboardType="phone-pad"
          />

          <Input
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="info@firma.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Ek Bilgiler</Text>

          <Input
            label="Adres"
            value={address}
            onChangeText={setAddress}
            placeholder="Tam adres..."
            multiline
            numberOfLines={3}
          />

          <Input
            label="Vergi Numarası"
            value={taxNumber}
            onChangeText={setTaxNumber}
            placeholder="1234567890"
            keyboardType="numeric"
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Değişiklikleri Kaydet"
          onPress={handleSubmit}
          loading={isLoading}
          icon="check"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
