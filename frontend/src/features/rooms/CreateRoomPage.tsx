import React from 'react';
import CreateRoomForm from '../../components/rooms/CreateRoomForm';
import Chatbox from '../../components/rooms/Chatbox';
import styles from './CreateRoomPage.module.css';

const CreateRoomPage: React.FC = () => {
  return (
    <div className={styles.contentArea}>
      <CreateRoomForm />
      <Chatbox />
    </div>
  );
};

export default CreateRoomPage; 