import axios from 'axios';

// URL de base de l'API
const API_URL = 'http://localhost:5000/api';

// Service pour les appels API au backend
const apiService = {
  // Récupérer toutes les conversations
  getConversations: async () => {
    try {
      const response = await axios.get(`${API_URL}/conversations`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },

  // Récupérer une conversation spécifique
  getConversationById: async (sessionId) => {
    try {
      const response = await axios.get(`${API_URL}/conversations/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  },

  // Créer une nouvelle conversation
  createConversation: async (sessionId, initialMessages = []) => {
    try {
      const response = await axios.post(`${API_URL}/conversations`, {
        sessionId,
        messages: initialMessages
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      throw error;
    }
  },

  // Ajouter un message à une conversation
  addMessage: async (sessionId, sender, content) => {
    try {
      const response = await axios.put(`${API_URL}/conversations/${sessionId}`, {
        sender,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  },

  // Terminer une conversation
  endConversation: async (sessionId) => {
    try {
      const response = await axios.patch(`${API_URL}/conversations/${sessionId}/end`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la terminaison de la conversation:', error);
      throw error;
    }
  }
};

export default apiService;
