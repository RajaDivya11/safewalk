require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sendWhatsAppRoute = require('./routes/sendWhatsApp');
const sendSmsRoute = require('./routes/sendSms');
const uploadProfilePhotoRoute = require('./routes/uploadProfilePhoto');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api', sendWhatsAppRoute);
app.use('/api', sendSmsRoute);
app.use('/', uploadProfilePhotoRoute);

// Health check
app.get('/api/check', (req, res) => {
  res.json({
    success: true,
    message: 'API is running'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
