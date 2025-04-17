import React from 'react';
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';

const SignRecognition = ({ isStreaming, onPredictionResult }) => {
  const [model, setModel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes] = useState([
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z', 'SPACE', 'DELETE'
  ]);

  // Chargement du modèle au montage du composant
  useEffect(() => {
    const loadModel = async () => {
      if (model) return; // Éviter de charger plusieurs fois
      
      try {
        setIsLoading(true);
        setError('');
        console.log('Chargement du modèle TensorFlow.js...');
        
        // Charger le modèle depuis le répertoire des modèles
        const loadedModel = await tf.loadLayersModel('/src/models/model.json');
        
        // Effectuer une prédiction factice pour réchauffer le modèle
        const dummyInput = tf.zeros([1, 28, 28, 3]);
        const warmupResult = loadedModel.predict(dummyInput);
        warmupResult.dispose();
        dummyInput.dispose();
        
        setModel(loadedModel);
        console.log('Modèle chargé avec succès!');
      } catch (error) {
        console.error('Erreur lors du chargement du modèle:', error);
        setError(`Erreur de chargement du modèle: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (model) {
        try {
          // Libérer les ressources du modèle
          model.dispose();
        } catch (e) {
          console.error('Erreur lors de la libération du modèle:', e);
        }
      }
    };
  }, []);

  // Prédiction lorsque la webcam est active
  useEffect(() => {
    let predictionInterval;
    
    const predictSign = async () => {
      if (!model || !isStreaming || !window.captureVideoFrame) return;
      
      try {
        // Capturer l'image de la webcam
        const canvas = window.captureVideoFrame();
        if (!canvas) return;

        // Redimensionner l'image à 28x28 pixels (taille attendue par le modèle)
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = 28;
        resizedCanvas.height = 28;
        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28);

        // Convertir l'image en tensor
        const imageData = ctx.getImageData(0, 0, 28, 28);
        const tensor = tf.browser.fromPixels(imageData)
          .div(255.0)                           // Normaliser les valeurs entre 0 et 1
          .expandDims(0);                       // Ajouter la dimension du batch

        // Faire la prédiction
        const predictions = model.predict(tensor);
        const results = await predictions.data();
        
        // Libérer les ressources
        tensor.dispose();
        predictions.dispose();

        // Trouver l'indice de la classe avec la plus haute probabilité
        const maxIndex = results.indexOf(Math.max(...results));
        const predictedClass = classes[maxIndex];
        const confidence = results[maxIndex];

        // Envoyer le résultat au composant parent
        onPredictionResult({
          sign: predictedClass,
          confidence: confidence,
          allPredictions: Array.from(results).map((prob, idx) => ({
            class: classes[idx],
            probability: prob
          })).sort((a, b) => b.probability - a.probability)
        });
      } catch (error) {
        console.error('Erreur lors de la prédiction:', error);
      }
    };

    if (isStreaming && model) {
      // Prédire toutes les secondes
      predictionInterval = setInterval(predictSign, 1000);
    }

    return () => {
      if (predictionInterval) clearInterval(predictionInterval);
    };
  }, [isStreaming, model, classes, onPredictionResult]);

  // Ce composant ne rend rien visuellement
  return (
    <>
      {isLoading && <div className="hidden">Chargement du modèle...</div>}
      {error && <div className="hidden">Erreur: {error}</div>}
    </>
  );
};

export default SignRecognition;
