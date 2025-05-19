const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const createMollieClient = require('@mollie/api-client');
const mollie = createMollieClient.default({ apiKey: process.env.MOLLIE_API_KEY });

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyParser.json());

app.post('/api/create-checkout-session', async (req, res) => {
  let { amount } = req.body;

  console.log("💡 Montant reçu du front :", amount);

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
      redirectUrl: 'https://expressoutlet.fr/success.html', // ✅ en ligne
      cancelUrl: 'https://expressoutlet.fr/cancel.html',    // ✅ en ligne
    });

    res.json({ url: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Erreur Mollie :', error);
    res.status(500).json({ error: 'Erreur Mollie' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

app.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cancel.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});





