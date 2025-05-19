const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const createMollieClient = require('@mollie/api-client');
const mollie = createMollieClient.default({ apiKey: process.env.MOLLIE_API_KEY });

const app = express();

// Sert les fichiers statiques du dossier public (frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());

// ✅ Route de création de paiement Mollie
app.post('/api/create-checkout-session', async (req, res) => {
  let { amount } = req.body;

  console.log("💡 Montant reçu du front :", amount); // 👈 pour vérifier le montant

  try {
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    amount = parseFloat(amount).toFixed(2);

    const payment = await mollie.payments.create({
      amount: {
        currency: 'EUR',
        value: amount,
      },
      description: 'Commande Outlet Express',
      redirectUrl: 'http://localhost:3000/success.html',
      cancelUrl: 'http://localhost:3000/cancel.html',
    });

    res.json({ url: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Erreur Mollie :', error);
    res.status(500).json({ error: 'Erreur Mollie' });
  }
});

// Routes classiques
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});




