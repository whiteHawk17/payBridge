import React from 'react';
import CreateRoomForm from '../../components/rooms/CreateRoomForm';
import styles from './CreateRoomPage.module.css';

const CreateRoomPage: React.FC = () => {
  return (
    <div className={styles.contentArea}>
      <CreateRoomForm />
    </div>
  );
};

export default CreateRoomPage; 