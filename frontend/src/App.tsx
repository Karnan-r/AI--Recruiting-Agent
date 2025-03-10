import React, { useState } from 'react';
import ChatBar from './components/ChatBar';
import Workspace from './components/Workspace';

const App = () => {
  const [sequence, setSequence] = useState('');

  const handleSequenceGenerated = (newSequence: string) => {
    setSequence(newSequence);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '40%', borderRight: '1px solid #ccc' }}>
        <ChatBar onSequenceGenerated={handleSequenceGenerated} />
      </div>
      <div style={{ width: '60%' }}>
        <Workspace sequence={sequence} />
      </div>
    </div>
  );
};

export default App;