// components/MessageList.tsx
import React from "react";

interface Message {
  text: string;
  isMine: boolean;
  sender: string;
}

interface MessageListProps {
  messages: Message[];
  endRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, endRef }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {messages.map((msg, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMine ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
          {!msg.isMine && (
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
              {msg.sender}
            </div>
          )}
          <div style={{
            backgroundColor: msg.isMine ? '#3b82f6' : '#f472b6',
            color: 'white',
            padding: '8px',
            borderRadius: '8px',
            maxWidth: '100%'
          }}>
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
