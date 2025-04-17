const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Utilisation d'une base de données MongoDB locale pour le développement
    const conn = await mongoose.connect('mongodb://localhost:27017/lotoquebec-sign-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
