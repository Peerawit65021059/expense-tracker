const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated, onDocumentDeleted} = require("firebase-functions/v2/firestore");
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

// API: Update transaction
exports.updateTransaction = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
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

    const transactionId = req.query.id;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required'
      });
    }

    const { type, amount, category, description } = req.body;

    // Verify ownership
    const transactionRef = db.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transactionDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    const updateData = {};
    if (type) updateData.type = type;
    if (amount) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    await transactionRef.update(updateData);

    res.json({
      success: true,
      data: {
        id: transactionId,
        ...transactionDoc.data(),
        ...updateData
      }
    });
  } catch (error) {
    logger.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API: Delete transaction
exports.deleteTransaction = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
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

    const transactionId = req.query.id;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required'
      });
    }

    // Verify ownership
    const transactionRef = db.collection('transactions').doc(transactionId);
    const transactionDoc = await transactionRef.get();

    if (!transactionDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (transactionDoc.data().userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden'
      });
    }

    await transactionRef.delete();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// API: Get transaction summary
exports.getTransactionSummary = onRequest({
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
      .get();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.type === 'income') {
        totalIncome += data.amount;
      } else if (data.type === 'expense') {
        totalExpenses += data.amount;
        const category = data.category || 'Other';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + data.amount;
      }
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        categoryBreakdown
      }
    });
  } catch (error) {
    logger.error('Error getting transaction summary:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Firestore triggers for real-time updates
exports.onTransactionCreated = onDocumentCreated('transactions/{transactionId}', (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log('No data associated with the event');
    return;
  }

  const data = snapshot.data();
  logger.log('Transaction created:', data);

  // You can add additional logic here, like sending notifications
  // or updating user statistics
});

exports.onTransactionUpdated = onDocumentUpdated('transactions/{transactionId}', (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  logger.log('Transaction updated from:', beforeData, 'to:', afterData);

  // You can add additional logic here
});

exports.onTransactionDeleted = onDocumentDeleted('transactions/{transactionId}', (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log('No data associated with the event');
    return;
  }

  const data = snapshot.data();
  logger.log('Transaction deleted:', data);

  // You can add additional logic here
});

// Firebase Authentication Functions

// Register user with Firebase Auth
exports.registerUser = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Create user with Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0]
    });

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    // Generate custom token for client-side authentication
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      },
      customToken
    });
  } catch (error) {
    logger.error('Registration error:', error);

    let errorMessage = 'Registration failed';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Email already exists';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email format';
    }

    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

// Login user (verify Firebase ID token)
exports.verifyToken = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify the ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Update last login
    await db.collection('users').doc(decodedToken.uid).update({
      lastLoginAt: new Date()
    });

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    res.json({
      success: true,
      message: 'Token verified successfully',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: userData?.displayName || decodedToken.name,
        emailVerified: decodedToken.email_verified,
        lastLoginAt: userData?.lastLoginAt
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Send password reset email
exports.sendPasswordReset = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Send password reset email
    await getAuth().sendPasswordResetEmail(email);

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    logger.error('Password reset error:', error);

    let errorMessage = 'Failed to send password reset email';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email';
    }

    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

// Send email verification
exports.sendEmailVerification = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify token and get user
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Send email verification
    await getAuth().sendEmailVerification(decodedToken.uid);

    res.json({
      success: true,
      message: 'Email verification sent successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email verification'
    });
  }
});

// Update user profile
exports.updateUserProfile = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { idToken, displayName, photoURL } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Update user in Firebase Auth
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    if (Object.keys(updateData).length > 0) {
      await getAuth().updateUser(decodedToken.uid, updateData);
    }

    // Update user document in Firestore
    await db.collection('users').doc(decodedToken.uid).update({
      ...updateData,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Delete user account
exports.deleteUserAccount = onRequest({
  region: 'asia-southeast1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'DELETE') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'ID token is required'
      });
    }

    // Verify token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Delete user from Firebase Auth
    await getAuth().deleteUser(decodedToken.uid);

    // Delete user document from Firestore (this will cascade delete transactions)
    await db.collection('users').doc(decodedToken.uid).delete();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

// Get user profile
exports.getUserProfile = onRequest({
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

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        emailVerified: decodedToken.email_verified,
        createdAt: userData.createdAt,
        lastLoginAt: userData.lastLoginAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});
