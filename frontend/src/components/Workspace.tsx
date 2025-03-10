import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5000");

const Workspace: React.FC<{ sequence: string }> = () => {
  const [content, setContent] = useState("Your recruiting sequence will appear here.");

  useEffect(() => {
    const handleWorkspaceUpdate = (data: string) => {
      console.log("Received sequence in workspace:", data);
      if (data) {
        setContent(data);
      }
    };

    socket.on("update_workspace", handleWorkspaceUpdate);
    return () => {
      socket.off("update_workspace", handleWorkspaceUpdate);
    };
  }, []);

  return (
    <div style={{ height: '100%', padding: '20px' }}>
      <h2>Sequence</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{
          width: '100%',
          height: 'calc(100vh - 120px)',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          resize: 'none',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
        }}
      />
    </div>
  );
};

export default Workspace;