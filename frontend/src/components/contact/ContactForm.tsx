import React, { useState } from 'react';
import styles from './ContactForm.module.css';

const ContactForm: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className={styles.contactFormContainer}>
      <form className={styles.contactForm} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" placeholder="name" required value={form.name} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Your Email</label>
            <input type="email" id="email" placeholder="you@example.com" required value={form.email} onChange={handleChange} />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="subject">Subject</label>
          <input type="text" id="subject" placeholder="e.g., Transaction Inquiry" required value={form.subject} onChange={handleChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message">Message</label>
          <textarea id="message" rows={6} placeholder="Write your message here..." required value={form.message} onChange={handleChange} />
        </div>
        <button type="submit" className={styles.btn + ' ' + styles.btnPrimary} disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm; 