import React from 'react';
import { MessageSquare, User, Send } from 'lucide-react';

const ChatInterface = ({ messages, prediction, onSendMessage }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl flex flex-col">
      <div className="bg-[#091F40] p-4">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <MessageSquare size={20} />
          Conversation
        </h2>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex gap-3 ${message.type === 'agent' ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'agent' ? 'bg-[#091F40] text-white' : 'bg-[#007BC2] text-white'
            }`}>
              <User size={16} />
            </div>
            <div className={`rounded-lg p-3 max-w-[80%] ${
              message.type === 'agent' 
                ? 'bg-gray-100 text-gray-800' 
                : 'bg-[#007BC2] text-white'
            }`}>
              {message.text}
            </div>
          </div>
        ))}

        {prediction && (
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-[#007BC2] text-white flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="rounded-lg p-3 max-w-[80%] bg-[#007BC2] text-white">
              {prediction}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Message traduit..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BC2]"
            value={prediction}
            readOnly
          />
          <button 
            className="px-4 py-2 bg-[#007BC2] text-white rounded-lg hover:bg-[#006AAD] transition-colors"
            onClick={() => prediction && onSendMessage(prediction)}
            disabled={!prediction}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
