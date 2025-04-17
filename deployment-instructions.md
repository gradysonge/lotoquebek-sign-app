# Guide de déploiement de l'application

## Prérequis
- Node.js installé (v14 ou supérieur)
- MongoDB installé ou accès à une instance MongoDB (locale ou distante)
- Git installé (optionnel, pour le clonage du dépôt)

## Déploiement en environnement de développement local

### 1. Structure du projet
Assurez-vous d'avoir la structure de fichiers suivante dans votre VS Code :

```
lotoquebec-sign-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── WebcamView.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   └── SignRecognition.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── modelService.js
│   │   ├── models/
│   │   │   ├── model.json
│   │   │   └── group1-shard*.bin
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── conversationController.js
    ├── models/
    │   └── Conversation.js
    ├── routes/
    │   └── api/
    │       └── conversations.js
    ├── server.js
    └── package.json
```

### 2. Installation des dépendances

#### Backend
```bash
cd lotoquebec-sign-app/backend
npm install
```

#### Frontend
```bash
cd lotoquebec-sign-app/frontend
npm install
```

### 3. Configuration de la base de données

Par défaut, l'application se connecte à MongoDB en local. Si vous souhaitez utiliser une instance MongoDB distante, créez un fichier `.env` dans le dossier `backend` avec le contenu suivant :

```
MONGO_URI=votre_uri_mongodb
PORT=5000
```

### 4. Lancement de l'application

#### Démarrer le backend
```bash
cd lotoquebec-sign-app/backend
node server.js
```

#### Démarrer le frontend
```bash
cd lotoquebec-sign-app/frontend
npm run dev
```

Accédez à l'application via l'URL fournie par Vite (généralement http://localhost:5173).

## Déploiement en production

### 1. Préparation du frontend

```bash
cd lotoquebec-sign-app/frontend
npm run build
```

Cette commande génère un dossier `dist` contenant les fichiers statiques optimisés pour la production.

### 2. Configuration du backend pour servir le frontend

Modifiez le fichier `server.js` pour servir les fichiers statiques du frontend :

```javascript
// Ajouter en haut du fichier
const path = require('path');

// Ajouter après les middlewares
// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  // Définir le dossier des fichiers statiques
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Toutes les routes non-API renvoient vers l'index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
  });
}
```

### 3. Déploiement sur un serveur

#### Option 1 : Déploiement sur un VPS (Digital Ocean, AWS EC2, etc.)

1. Transférez les fichiers sur votre serveur
2. Installez les dépendances
3. Configurez un proxy inverse (Nginx, Apache) pour rediriger le trafic vers votre application
4. Utilisez PM2 pour gérer le processus Node.js :

```bash
npm install -g pm2
cd lotoquebec-sign-app/backend
pm2 start server.js
```

#### Option 2 : Déploiement sur une plateforme PaaS (Heroku, Render, etc.)

1. Suivez les instructions spécifiques à la plateforme pour déployer une application Node.js
2. Configurez les variables d'environnement (MONGO_URI, NODE_ENV=production)
3. Assurez-vous que le package.json du backend contient un script "start" :

```json
"scripts": {
  "start": "node server.js"
}
```

### 4. Configuration de MongoDB en production

Pour la production, il est recommandé d'utiliser un service MongoDB hébergé comme MongoDB Atlas :

1. Créez un compte sur MongoDB Atlas
2. Créez un cluster et une base de données
3. Obtenez l'URI de connexion et configurez-le dans les variables d'environnement de votre serveur

## Considérations de sécurité

1. Assurez-vous que votre application utilise HTTPS en production
2. Protégez vos variables d'environnement contenant des informations sensibles
3. Implémentez des limites de taux (rate limiting) sur vos API
4. Considérez l'ajout d'une authentification pour les routes sensibles

## Maintenance

1. Surveillez les logs de l'application pour détecter les erreurs
2. Mettez régulièrement à jour les dépendances pour corriger les vulnérabilités
3. Effectuez des sauvegardes régulières de votre base de données
