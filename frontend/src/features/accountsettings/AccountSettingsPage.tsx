import React, { useState } from 'react';
import PaymentMethodsSection from '../../components/accountsettings/PaymentMethodsSection';
import AddMethodModal from '../../components/accountsettings/AddMethodModal';
import styles from './AccountSettingsPage.module.css';

export interface PaymentMethod {
  type: 'upi' | 'bank';
  upi?: string;
  account?: string;
  ifsc?: string;
  default: boolean;
}

const AccountSettingsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const addPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethods((prev) => {
      const updated = prev.map((m) => ({ ...m, default: false }));
      return [{ ...method, default: true }, ...updated];
    });
    setModalOpen(false);
  };

  const setDefault = (idx: number) => {
    setPaymentMethods((prev) => prev.map((m, i) => ({ ...m, default: i === idx })));
  };

  const removeMethod = (idx: number) => {
    setPaymentMethods((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length && !updated.some((m) => m.default)) updated[0].default = true;
      return updated;
    });
  };

  return (
    <main className={styles.mainContent}>
      <h1 className={styles.mainHeaderBar}>Account Settings - Payment Methods</h1>
      <PaymentMethodsSection
        paymentMethods={paymentMethods}
        onAdd={() => setModalOpen(true)}
        onSetDefault={setDefault}
        onRemove={removeMethod}
      />
      <AddMethodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addPaymentMethod}
      />
    </main>
  );
};

export default AccountSettingsPage; 