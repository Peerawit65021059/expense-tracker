const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '3600',
};

// Handle CORS preflight requests
function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.set(corsHeaders).status(204).send('');
    return true;
  }
  res.set(corsHeaders);
  return false;
}

// API: Get all transactions for a user
exports.getTransactions = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Unauthorized'});
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const transactionsRef = db.collection('transactions');
    const snapshot = await transactionsRef
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    logger.error('Error getting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API: Add new transaction
exports.addTransaction = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({error: 'Unauthorized'});
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { type, amount, category, description } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, amount, category'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    const transactionData = {
      userId,
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      timestamp: new Date()
    };

    const docRef = await db.collection('transactions').add(transactionData);

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...transactionData
      }
    });
  } catch (error) {
    logger.error('Error adding transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Simple test function to verify deployment works
exports.helloWorld = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  logger.info('Hello World function called');

  res.json({
    success: true,
    message: 'Hello World from Firebase Functions!',
    timestamp: new Date().toISOString()
  });
});
