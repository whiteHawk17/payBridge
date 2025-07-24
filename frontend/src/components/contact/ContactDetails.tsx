import React, { useMemo } from 'react';
import styles from './ContactDetails.module.css';

const contacts = [
  {
    name: "Vinay",
    email: "vini17102005@gmail.com",
    phone: "+918949716631"
  },
  {
    name: "Aaditya",
    email: "aadityamathur1077@gmail.com",
    phone: "+918826019356"
  }
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ContactDetails: React.FC = () => {
  const randomizedContacts = useMemo(() => shuffleArray(contacts), []);

  return (
    <div className={styles.contactDetails}>
      <div className={styles.contactInfoItem}>
        <div className={styles.infoIcon}><i className="fas fa-envelope"></i></div>
        <div className={styles.infoText}>
          <h3>Email Us</h3>
          <p>Get in touch with the team directly.</p>
          {randomizedContacts.map((contact) => (
            <a key={contact.email} href={`mailto:${contact.email}`}>{contact.name}'s Email</a>
          ))}
        </div>
      </div>
      <div className={styles.contactInfoItem}>
        <div className={styles.infoIcon}><i className="fas fa-phone"></i></div>
        <div className={styles.infoText}>
          <h3>Call Us</h3>
          <p>We are available for urgent matters.</p>
          {randomizedContacts.map((contact) => (
            <a key={contact.phone} href={`tel:${contact.phone}`}>{contact.name}'s Number</a>
          ))}
        </div>
      </div>
      <div className={styles.contactInfoItem}>
        <div className={styles.infoIcon}><i className="fas fa-map-marker-alt"></i></div>
        <div className={styles.infoText}>
          <h3>Our Office</h3>
          <p>New Delhi, India</p>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails; 