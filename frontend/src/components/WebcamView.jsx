import React, { useRef, useState, useEffect } from 'react';
import { Video, Play, StopCircle } from 'lucide-react';

const WebcamView = ({ onPrediction, isStreaming, setIsStreaming }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  const startWebcam = async () => {
    try {
      setError(''); // Effacer erreurs précédentes si IL Y en a 
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
      setError(''); // Effacer les erreurs lors de l'arrêt
    }
  };

  // Exposer la référence vidéo pour la capture d'images
  useEffect(() => {
    if (videoRef.current) {
      // Cette fonction sera utilisée par le service de modèle pour capturer des images
      window.captureVideoFrame = () => {
        if (!videoRef.current) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        return canvas;
      };
    }
    
    return () => {
      delete window.captureVideoFrame;
    };
  }, [videoRef.current]);

  return (
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
  );
};

export default WebcamView;
