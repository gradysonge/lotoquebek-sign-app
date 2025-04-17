import React, { useState, useEffect } from 'react';
import WebcamView from './components/WebcamView';
import ChatInterface from './components/ChatInterface';
import SignRecognition from './components/SignRecognition';
import apiService from './services/api';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'agent',
      text: 'Bonjour! Je suis là pour vous aider. Comment puis-je vous assister aujourd\'hui?'
    }
  ]);

  // Initialiser la session au chargement de l'application
  useEffect(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    
    // Créer une nouvelle conversation dans la base de données
    const initConversation = async () => {
      try {
        await apiService.createConversation(newSessionId, [
          {
            sender: 'agent',
            content: 'Bonjour! Je suis là pour vous aider. Comment puis-je vous assister aujourd\'hui?'
          }
        ]);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la conversation:', error);
      }
    };
    
    initConversation();
  }, []);

  // Fonction pour traiter le résultat de la prédiction
  const handlePredictionResult = (result) => {
    if (!result) return;
    
    const { sign, confidence } = result;
    
    // Si la confiance est suffisamment élevée, traiter le signe
    if (confidence > 0.7) {
      if (sign === 'DELETE') {
        // Supprimer le dernier caractère
        setCurrentText(prev => prev.slice(0, -1));
      } else if (sign === 'SPACE') {
        // Ajouter un espace
        setCurrentText(prev => prev + ' ');
      } else {
        // Ajouter le signe à la prédiction actuelle
        setCurrentText(prev => prev + sign);
      }
    }
  };

  // Mettre à jour la prédiction affichée lorsque le texte courant change
  useEffect(() => {
    setPrediction(currentText);
  }, [currentText]);

  // Fonction pour envoyer un message
  const handleSendMessage = async (text) => {
    if (!text.trim() || !sessionId) return;
    
    // Ajouter le message de l'utilisateur à l'interface
    setMessages(prev => [...prev, { text, type: 'user' }]);
    
    // Sauvegarder le message dans la base de données
    try {
      await apiService.addMessage(sessionId, 'client', text);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
    
    // Réinitialiser la prédiction et le texte courant
    setPrediction('');
    setCurrentText('');
    
    // Simuler une réponse de l'agent
    setTimeout(async () => {
      const agentResponse = "J'ai bien reçu votre message. Comment puis-je vous aider davantage?";
      
      // Ajouter la réponse de l'agent à l'interface
      setMessages(prev => [...prev, { 
        text: agentResponse, 
        type: 'agent' 
      }]);
      
      // Sauvegarder la réponse dans la base de données
      try {
        await apiService.addMessage(sessionId, 'agent', agentResponse);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la réponse de l\'agent:', error);
      }
    }, 1000);
  };

  // Terminer la conversation lorsque la webcam est arrêtée
  useEffect(() => {
    if (!isStreaming && sessionId) {
      const endCurrentSession = async () => {
        try {
          await apiService.endConversation(sessionId);
        } catch (error) {
          console.error('Erreur lors de la terminaison de la conversation:', error);
        }
      };
      
      // Ne terminer la session que si elle a été initialisée et que la webcam était active auparavant
      if (sessionId && messages.length > 1) {
        endCurrentSession();
      }
    }
  }, [isStreaming, sessionId, messages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#091F40] to-[#1B3B6F]">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src="https://images.unsplash.com/photo-1584447128309-b66b7a4d1b57?w=96&h=96&fit=crop&crop=faces" 
              alt="Agent" 
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Service client Loto-Québec
              </h1>
              <p className="text-blue-200">
                Support en langue des signes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WebcamView 
              isStreaming={isStreaming} 
              setIsStreaming={setIsStreaming} 
            />
            <ChatInterface 
              messages={messages} 
              prediction={prediction} 
              onSendMessage={handleSendMessage} 
            />
          </div>
          
          {/* Composant invisible qui gère la reconnaissance des signes */}
          <SignRecognition 
            isStreaming={isStreaming}
            onPredictionResult={handlePredictionResult}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
