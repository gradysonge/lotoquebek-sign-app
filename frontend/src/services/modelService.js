import * as tf from '@tensorflow/tfjs';

class SignRecognitionService {
  constructor() {
    this.model = null;
    this.isModelLoading = false;
    this.isModelLoaded = false;
    this.classes = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
      'U', 'V', 'W', 'X', 'Y', 'Z', 'SPACE', 'DELETE'
    ];
  }

  async loadModel() {
    if (this.isModelLoaded) return true;
    if (this.isModelLoading) return false;

    try {
      this.isModelLoading = true;
      console.log('Chargement du modèle TensorFlow.js...');
      
      // Charger le modèle depuis le répertoire des modèles
      this.model = await tf.loadLayersModel('/src/models/model.json');
      
      // Effectuer une prédiction factice pour réchauffer le modèle
      const dummyInput = tf.zeros([1, 28, 28, 3]);
      const warmupResult = this.model.predict(dummyInput);
      warmupResult.dispose();
      dummyInput.dispose();
      
      console.log('Modèle chargé avec succès!');
      this.isModelLoaded = true;
      this.isModelLoading = false;
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement du modèle:', error);
      this.isModelLoading = false;
      return false;
    }
  }

  async predictSign() {
    if (!this.isModelLoaded) {
      const loaded = await this.loadModel();
      if (!loaded) return null;
    }

    // Vérifier si la fonction de capture est disponible
    if (!window.captureVideoFrame) {
      console.error('La fonction de capture vidéo n\'est pas disponible');
      return null;
    }

    try {
      // Capturer l'image de la webcam
      const canvas = window.captureVideoFrame();
      if (!canvas) return null;

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
      const predictions = this.model.predict(tensor);
      const results = await predictions.data();
      
      // Libérer les ressources
      tensor.dispose();
      predictions.dispose();

      // Trouver l'indice de la classe avec la plus haute probabilité
      const maxIndex = results.indexOf(Math.max(...results));
      const predictedClass = this.classes[maxIndex];
      const confidence = results[maxIndex];

      return {
        sign: predictedClass,
        confidence: confidence,
        allPredictions: Array.from(results).map((prob, idx) => ({
          class: this.classes[idx],
          probability: prob
        })).sort((a, b) => b.probability - a.probability)
      };
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
      return null;
    }
  }
}

// Exporter une instance unique du service
const signRecognitionService = new SignRecognitionService();
export default signRecognitionService;
