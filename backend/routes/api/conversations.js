const express = require('express');
const router = express.Router();
const conversationController = require('../../controllers/conversationController');

// Route pour récupérer toutes les conversations
router.get('/', conversationController.getConversations);

// Route pour récupérer une conversation spécifique
router.get('/:sessionId', conversationController.getConversationById);

// Route pour créer une nouvelle conversation
router.post('/', conversationController.createConversation);

// Route pour ajouter un message à une conversation
router.put('/:sessionId', conversationController.addMessage);

// Route pour terminer une conversation
router.patch('/:sessionId/end', conversationController.endConversation);

// Route pour supprimer une conversation
router.delete('/:sessionId', conversationController.deleteConversation);

module.exports = router;
