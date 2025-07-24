import React, { useEffect, useState } from 'react';
import styles from './ProfileInfoCard.module.css';
import axios from 'axios';

const ProfileInfoCard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/profile', { withCredentials: true })
      .then(res => {
        setProfile(res.data);
        setName(res.data.name || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => { setEditing(false); setName(profile.name); setError(''); };
  const handleSave = () => {
    setSaving(true);
    setError('');
    axios.put('/profile', { name }, { withCredentials: true })
      .then(res => {
        setProfile(res.data);
        setEditing(false);
        setSaving(false);
      })
      .catch(err => {
        setError('Failed to update.');
        setSaving(false);
      });
  };

  if (loading) return <div className={styles.profileCard}><p>Loading...</p></div>;
  if (!profile) return <div className={styles.profileCard}><p>Failed to load profile.</p></div>;

  return (
    <div className={styles.profileCard}>
      <div className={styles.cardHeader}>
        <h2>Profile Information</h2>
        {!editing && <button className={styles.btn + ' ' + styles.btnSecondary} onClick={handleEdit}>Edit Profile</button>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Full Name</span>
          {editing ? (
            <input value={name} onChange={e => setName(e.target.value)} disabled={saving} />
          ) : (
            <span className={styles.infoValue}>{profile.name}</span>
          )}
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email Address</span>
          <span className={styles.infoValue}>{profile.email}</span>
        </div>
        {profile.photo && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Photo</span>
            <img src={profile.photo} alt={profile.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
          </div>
        )}
        {editing && (
          <div className={styles.editActions}>
            <button className={styles.btn + ' ' + styles.btnPrimary} onClick={handleSave} disabled={saving}>Save</button>
            <button className={styles.btn + ' ' + styles.btnSecondary} onClick={handleCancel} disabled={saving}>Cancel</button>
            {error && <span className={styles.error}>{error}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoCard; 