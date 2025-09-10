import React from 'react';
import ReactDOM from 'react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./auth');

app.use(express.json());
app.use('/api', authRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));

