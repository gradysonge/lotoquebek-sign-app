const Conversation = require('../models/Conversation');

// Récupérer toutes les conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ startTime: -1 });
    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer une conversation spécifique par sessionId
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une nouvelle conversation
exports.createConversation = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Vérifier si une conversation avec ce sessionId existe déjà
    const existingConversation = await Conversation.findOne({ sessionId });
    
    if (existingConversation) {
      return res.status(400).json({ message: 'Une conversation avec cet ID de session existe déjà' });
    }
    
    const newConversation = new Conversation({
      sessionId,
      messages: req.body.messages || []
    });
    
    const savedConversation = await newConversation.save();
    res.status(201).json(savedConversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Ajouter un message à une conversation existante
exports.addMessage = async (req, res) => {
  try {
    const { sender, content } = req.body;
    
    if (!sender || !content) {
      return res.status(400).json({ message: 'Sender et content sont requis' });
    }
    
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    conversation.messages.push({
      sender,
      content,
      timestamp: new Date()
    });
    
    const updatedConversation = await conversation.save();
    res.json(updatedConversation);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Terminer une conversation (ajouter endTime)
exports.endConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ sessionId: req.params.sessionId });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    conversation.endTime = new Date();
    const updatedConversation = await conversation.save();
    
    res.json(updatedConversation);
  } catch (error) {
    console.error('Erreur lors de la terminaison de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une conversation
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ sessionId: req.params.sessionId });
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
