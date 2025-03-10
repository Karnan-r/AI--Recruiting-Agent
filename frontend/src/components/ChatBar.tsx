import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://127.0.0.1:5000');

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const ChatBar: React.FC<{ onSequenceGenerated: (sequence: string) => void }> = ({ onSequenceGenerated }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello, welcome! How can I help you today?' }
  ]);
  const [step, setStep] = useState(1);
  const [userInputs, setUserInputs] = useState<string[]>([]);

  useEffect(() => {
    socket.on("update_workspace", (sequence: string) => {
      console.log("Received sequence in ChatBar:", sequence);
      if (sequence) {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: 'Your sequence has been generated!' 
        }]);
        onSequenceGenerated(sequence);
      }
    });

    return () => {
      socket.off("update_workspace");
    };
  }, [onSequenceGenerated]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    setUserInputs(prev => [...prev, message]);

    if (step === 3) {
      const finalInput = userInputs.join('. ') + '. ' + message;
      console.log("Sending final input:", finalInput);
      socket.emit('generate_sequence', { input: finalInput });
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Generating your sequence...' 
      }]);
    } else {
      const nextPrompt = step === 1 
        ? 'What would you like to say?' 
        : 'Could you provide more details on your recruiting needs?';
      
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'ai', text: nextPrompt }]);
      }, 500);
      setStep(prev => prev + 1);
    }

    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '10px' }}>
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        marginBottom: '10px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.sender === 'user' ? 'right' : 'left',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '10px',
              borderRadius: '10px',
              maxWidth: '80%',
              backgroundColor: msg.sender === 'user' ? '#007BFF' : '#E5E5E5',
              color: msg.sender === 'user' ? 'white' : 'black'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        rows={3}
        style={{ width: '100%', resize: 'none', marginBottom: '10px' }}
      />

      <button
        onClick={handleSend}
        style={{
          padding: '10px',
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Send
      </button>
    </div>
  );
};

export default ChatBar;