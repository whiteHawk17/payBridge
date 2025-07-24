import React, { useEffect, useState } from 'react';
import styles from './ActiveRooms.module.css';
import { BACKEND_BASE_URL } from '../../api/config';

const ActiveRooms: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/dashboard/rooms/active`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <section className={styles.activeRooms}><h2>Active Rooms</h2><p>Loading...</p></section>;
  if (!rooms.length) return <section className={styles.activeRooms}><h2>Active Rooms</h2><p>No active rooms found.</p></section>;

  return (
    <section className={styles.activeRooms}>
      <h2>Active Rooms</h2>
      <div className={styles.roomsGrid}>
        {rooms.map((room, idx) => (
          <div className={styles.roomCard} key={room._id || idx}>
            <div className={styles.roomCardHeader}>
              <h3>{room._id}</h3>
              <span className={styles.status + ' ' + styles[room.status?.toLowerCase() || '']}>{room.status}</span>
            </div>
            <p className={styles.roomPrice}>{room.amount ? `₹${room.amount}` : 'No amount'}</p>
            <p className={styles.roomReason}><b>Reason:</b> {room.reason}</p>
            <div className={styles.roomParticipants}>
              <span>Participants:</span>
              <div className={styles.avatars}>
                {[room.buyer, room.seller].map((user, i) => (
                  user ? (
                    <span key={i} title={user.name} style={{ display: 'inline-block', marginRight: 8 }}>
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      ) : (
                        <span className={styles.avatarFallback}>{user.name ? user.name[0] : '?'}</span>
                      )}
                    </span>
                  ) : null
                ))}
              </div>
            </div>
            <button className={styles.btn + ' ' + styles.btnPrimary + ' ' + styles.viewDetailsBtn}>View Details</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActiveRooms; 