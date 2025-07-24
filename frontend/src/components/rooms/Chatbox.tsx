import React, { useState } from 'react';
import styles from './Chatbox.module.css';

interface Message {
  text: string;
  type: 'sent' | 'received';
  timestamp: string;
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Welcome! Discuss the details of your transaction here.',
      type: 'received',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        {
          text: input,
          type: 'sent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.chatboxContainer}>
      <div className={styles.chatboxHeader}>
        <h3>Room Chat</h3>
      </div>
      <div className={styles.chatboxMessages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles.message + ' ' + styles[msg.type]}>
            <p>{msg.text}</p>
            <span className={styles.timestamp}>{msg.timestamp}</span>
          </div>
        ))}
      </div>
      <div className={styles.chatboxInput}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}><i className="fas fa-paper-plane"></i></button>
      </div>
    </div>
  );
};

export default Chatbox; 