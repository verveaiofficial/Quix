import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInputBar from './components/ChatInputBar';
import FlashModelPage from './components/FlashModelPage';
import CoderPage from './components/CoderPage';
import DeepThinkReasoning from './components/DeepThinkReasoning';

export default function App() {
  const [currentModel, setCurrentModel] = useState<'Flash' | 'Lite' | 'DeepThink' | 'Thinking' | 'Coder'>('Flash');

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar currentModel={currentModel} onSelectModel={setCurrentModel} />
      <div className="flex flex-col flex-1 h-full">
        <Header currentModel={currentModel} />
        <main className="flex-1 overflow-y-auto">
          {currentModel === 'Coder' && <CoderPage />}
          {currentModel === 'DeepThink' && <DeepThinkReasoning />}
          {(currentModel === 'Flash' || currentModel === 'Lite' || currentModel === 'Thinking') && (
            <FlashModelPage model={currentModel} />
          )}
        </main>
        <ChatInputBar currentModel={currentModel} />
      </div>
    </div>
  );
}