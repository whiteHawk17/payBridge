import React from 'react';
import ContactHeader from '../../components/contact/ContactHeader';
import ContactForm from '../../components/contact/ContactForm';
import ContactDetails from '../../components/contact/ContactDetails';
import styles from './ContactPage.module.css';

const ContactPage: React.FC = () => {
  return (
    <div className={styles.contentArea}>
      <ContactHeader />
      <div className={styles.contactGrid}>
        <ContactForm />
        <ContactDetails />
      </div>
    </div>
  );
};

export default ContactPage; 