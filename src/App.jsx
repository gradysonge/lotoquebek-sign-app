import React, { useRef, useState, useEffect } from 'react';
import { Video, StopCircle, Play, MessageSquare, User, Send } from 'lucide-react';

function App() {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([
    {
      type: 'agent',
      text: 'Bonjour! Je suis là pour vous aider. Comment puis-je vous assister aujourd\'hui?'
    }
  ]);

  const startWebcam = async () => {
    try {
      setError(''); // je vais tester plus tar5d pour la webca
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640,
          height: 480
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Erreur d'accès à la webcam:", err);
      
      if (err instanceof Error) {
        if (err.name === 'NotFoundError' || err.name === 'DeviceNotFoundError') {
          setError('Aucune webcam détectée. Veuillez vérifier que votre webcam est correctement connectée et qu\'elle n\'est pas utilisée par une autre application.');
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('L\'accès à la webcam a été refusé. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
        } else {
          setError('Une erreur est survenue lors de l\'accès à la webcam. Veuillez réessayer.');
        }
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setError(''); // .... je vais y revenir apres le test avec camera ce soir 
    }
  };

  const predictSign = async () => {
    if (!videoRef.current) return;
    setPrediction('En attente de prédiction...');
  };

  useEffect(() => {
    let interval;
    
    if (isStreaming) {
      interval = window.setInterval(predictSign, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  const addMessage = (text, type) => {
    setMessages(prev => [...prev, { text, type }]);
  };

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
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-[#091F40] p-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <Video size={20} />
                  Votre caméra
                </h2>
              </div>
              
              <div className="relative aspect-video bg-gray-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <p className="text-white text-lg">
                      {error || 'Caméra désactivée'}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                {!isStreaming ? (
                  <button
                    onClick={startWebcam}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#007BC2] text-white rounded-lg hover:bg-[#006AAD] transition-colors"
                  >
                    <Play size={20} />
                    Démarrer la communication
                  </button>
                ) : (
                  <button
                    onClick={stopWebcam}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <StopCircle size={20} />
                    Terminer la communication
                  </button>
                )}
              </div>
            </div>

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
                    onClick={() => prediction && addMessage(prediction, 'user')}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;