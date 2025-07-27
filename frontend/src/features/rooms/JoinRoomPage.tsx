import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BACKEND_BASE_URL } from '../../api/config';
import styles from './JoinRoomPage.module.css';

interface LocationState {
  roomId?: string;
}

const JoinRoomPage: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If roomId is passed from navigation state, pre-fill it
    const state = location.state as LocationState;
    if (state?.roomId) {
      setRoomId(state.roomId);
    }
  }, [location.state]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Please enter a room ID or code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/dashboard/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roomId: roomId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if the error is because user is already a participant
        if (data.error && (
          data.error.includes('already the buyer') || 
          data.error.includes('already the seller') ||
          data.error.includes('already a participant')
        )) {
          // User is already in the room, redirect directly
          setSuccess('You are already in this room! Opening room...');
          setTimeout(() => {
            navigate(`/rooms/${roomId.trim()}`);
          }, 1000);
        } else {
          throw new Error(data.error || 'Failed to join room');
        }
      } else {
        setSuccess('Successfully joined the room! Opening room...');
        setTimeout(() => {
          navigate(`/rooms/${roomId.trim()}`);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.joinRoomContainer}>
      <div className={styles.joinRoomCard}>
        <div className={styles.joinRoomHeader}>
          <h1>Join Room</h1>
          <p>Enter the room ID or code to join an existing transaction room</p>
        </div>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        <form onSubmit={handleJoinRoom} className={styles.joinRoomForm}>
          <div className={styles.formGroup}>
            <label htmlFor="room-id">Room ID / Code</label>
            <input
              type="text"
              id="room-id"
              placeholder="Enter room ID or code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.btn + ' ' + styles.btnSecondary}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.btn + ' ' + styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomPage; 