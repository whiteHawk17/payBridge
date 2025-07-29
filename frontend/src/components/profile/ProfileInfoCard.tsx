import React, { useEffect, useState } from 'react';
import styles from './ProfileInfoCard.module.css';
import axios from 'axios';
import { BACKEND_BASE_URL } from '../../api/config';

const ProfileInfoCard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching profile from:', `${BACKEND_BASE_URL}/profile`);
    axios.get(`${BACKEND_BASE_URL}/profile`, { withCredentials: true })
      .then(res => {
        console.log('Profile fetched successfully:', res.data);
        setProfile(res.data);
        setName(res.data.name || '');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => { setEditing(false); setName(profile.name); setError(''); setAvatarFile(null); setAvatarPreview(null); };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setSaving(true);
    setError('');
    if (avatarFile) {
      // Upload avatar first
      const formData = new FormData();
      formData.append('photo', avatarFile);
      axios.post(`${BACKEND_BASE_URL}/profile/avatar`, formData, { withCredentials: true })
        .then(res => {
          // Update profile with new name and photo
          axios.put(`${BACKEND_BASE_URL}/profile`, { name }, { withCredentials: true })
            .then(res2 => {
              setProfile(res2.data);
              setEditing(false);
              setSaving(false);
              setAvatarFile(null);
              setAvatarPreview(null);
              window.location.reload(); // Reload to update avatar everywhere
            })
            .catch(() => {
              setError('Failed to update.');
              setSaving(false);
            });
        })
        .catch(() => {
          setError('Failed to upload avatar.');
          setSaving(false);
        });
    } else {
      axios.put(`${BACKEND_BASE_URL}/profile`, { name }, { withCredentials: true })
        .then(res => {
          setProfile(res.data);
          setEditing(false);
          setSaving(false);
        })
        .catch(() => {
          setError('Failed to update.');
          setSaving(false);
        });
    }
  };

  console.log('ProfileInfoCard render - loading:', loading, 'profile:', profile);
  
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
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Photo</span>
          {editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label className={styles.avatarUploadLabel}>
                <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={saving} style={{ display: 'none' }} />
                <span className={styles.avatarUploadBtn}>Upload</span>
              </label>
              {(avatarPreview || profile.photo) && (
                <img src={avatarPreview || profile.photo} alt={profile.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
              )}
              {avatarPreview && <button onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className={styles.btn + ' ' + styles.btnSecondary} style={{ fontSize: 12 }}>Remove</button>}
            </div>
          ) : (
            profile.photo ? <img src={profile.photo} alt={profile.name} style={{ width: 48, height: 48, borderRadius: '50%' }} /> : <span className={styles.infoValue}>{profile.name ? profile.name[0] : '?'}</span>
          )}
        </div>
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