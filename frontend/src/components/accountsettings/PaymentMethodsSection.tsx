import React from 'react';
import { PaymentMethod } from '../../features/accountsettings/AccountSettingsPage';
import styles from './PaymentMethodsSection.module.css';

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  onAdd: () => void;
  onSetDefault: (idx: number) => void;
  onRemove: (idx: number) => void;
}

const PaymentMethodsSection: React.FC<PaymentMethodsSectionProps> = ({ paymentMethods, onAdd, onSetDefault, onRemove }) => (
  <section className={styles.paymentMethodsSection}>
    <div className={styles.paymentMethodsHeader}>
      <h2>Linked Payment Methods</h2>
      <button className={styles.btn + ' ' + styles.btnPrimary} onClick={onAdd}><i className="fas fa-plus"></i> Add Payment Method</button>
    </div>
    <div className={styles.methodsGrid}>
      {paymentMethods.length === 0 ? (
        <p style={{ color: '#cbd5e1' }}>No payment methods linked yet.</p>
      ) : (
        paymentMethods.map((method, idx) => (
          <div className={styles.methodCard + (method.default ? ' ' + styles.default : '')} key={idx}>
            {method.type === 'upi' ? (
              <>
                <div className={styles.methodType}><i className="fas fa-mobile-alt"></i> UPI</div>
                <div className={styles.methodDetails}>{method.upi}</div>
              </>
            ) : (
              <>
                <div className={styles.methodType}><i className="fas fa-university"></i> Bank</div>
                <div className={styles.methodDetails}>A/C: {method.account}<br />IFSC: {method.ifsc}</div>
              </>
            )}
            {method.default && <div className={styles.methodDefaultBadge}>Default</div>}
            <div className={styles.methodActions}>
              {!method.default && <button className={styles.btn + ' ' + styles.btnSecondary} onClick={() => onSetDefault(idx)}>Set Default</button>}
              <button className={styles.btn + ' ' + styles.btnSecondary} onClick={() => onRemove(idx)}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        ))
      )}
    </div>
  </section>
);

export default PaymentMethodsSection; 