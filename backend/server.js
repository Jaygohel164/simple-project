// ============================================
// DHRUVI FEEDBACK APP - BACKEND WITH AUTH
// Version 2.0 - With Login/Register System
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ============================================
// CONFIGURATION
// ============================================

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dhruvifeedback';
const JWT_SECRET = process.env.JWT_SECRET || 'dhruvi-super-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dhruvi@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dhruvi123';

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(bodyParser.json());

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    createAdminUser();
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error);
  });

// ============================================
// SCHEMAS & MODELS
// ============================================

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Feedback Schema (Updated with userId)
const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  whatDoYouThink: {
    type: String,
    required: true
  },
  kindOfPerson: {
    type: String,
    required: true
  },
  positiveThings: {
    type: String,
    required: true
  },
  negativeThings: {
    type: String,
    required: true
  },
  nature: {
    type: String,
    required: true
  },
  adviceForMe: {
    type: String,
    required: true
  },
  memoryWithMe: {
    type: String,
    required: true
  },
  rateOurFriendship: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  additionalMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

// ============================================
// HELPER FUNCTIONS
// ============================================

// Create Admin User on Startup
async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      const adminUser = new User({
        name: 'Dhruvi (Admin)',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('👑 Admin user created successfully!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      console.log('👑 Admin user already exists');
    }
  } catch (error) {
    console.log('Error creating admin user:', error);
  }
}

// Generate JWT Token
function generateToken(user) {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

// Verify JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// Check if Admin
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
}

// ============================================
// API ROUTES - PUBLIC
// ============================================

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: '🌸 Welcome to Dhruvi Feedback API v2.0!',
    status: 'Server is running successfully',
    features: ['Authentication', 'User Roles', 'Protected Responses']
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// ============================================
// API ROUTES - AUTHENTICATION
// ============================================

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });
    
    await newUser.save();
    
    // Generate token
    const token = generateToken(newUser);
    
    console.log(`✅ New user registered: ${email}`);
    
    res.status(201).json({
      message: 'Registration successful! 🎉',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.log('❌ Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user);
    
    console.log(`✅ User logged in: ${email} (${user.role})`);
    
    res.status(200).json({
      message: 'Login successful! 🎉',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.log('❌ Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// ============================================
// API ROUTES - FEEDBACK (Protected)
// ============================================

// Submit Feedback (Requires Login)
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    console.log('📩 Received new feedback from:', req.user.email);
    
    const newFeedback = new Feedback({
      userId: req.user.userId,
      userName: req.user.name,
      userEmail: req.user.email,
      whatDoYouThink: req.body.whatDoYouThink,
      kindOfPerson: req.body.kindOfPerson,
      positiveThings: req.body.positiveThings,
      negativeThings: req.body.negativeThings,
      nature: req.body.nature,
      adviceForMe: req.body.adviceForMe,
      memoryWithMe: req.body.memoryWithMe,
      rateOurFriendship: req.body.rateOurFriendship,
      additionalMessage: req.body.additionalMessage
    });
    
    const savedFeedback = await newFeedback.save();
    
    console.log('✅ Feedback saved successfully!');
    
    res.status(201).json({
      message: 'Thank you for your feedback! 💖',
      data: savedFeedback
    });
    
  } catch (error) {
    console.log('❌ Error saving feedback:', error);
    res.status(500).json({ message: 'Error saving feedback', error: error.message });
  }
});

// Get User's OWN Feedbacks Only (Normal Users)
app.get('/api/feedback/my', authenticateToken, async (req, res) => {
  try {
    const myFeedbacks = await Feedback.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    console.log(`📋 User ${req.user.email} retrieved their ${myFeedbacks.length} feedbacks`);
    
    res.status(200).json({
      count: myFeedbacks.length,
      data: myFeedbacks
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
});

// Get ALL Feedbacks (Admin Only)
app.get('/api/feedback/all', authenticateToken, isAdmin, async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    console.log(`👑 Admin retrieved all ${allFeedbacks.length} feedbacks`);
    
    res.status(200).json({
      count: allFeedbacks.length,
      data: allFeedbacks
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
  }
});

// Get Feedback by ID (User can only see their own, Admin can see all)
app.get('/api/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns this feedback or is admin
    if (feedback.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only view your own feedback.' });
    }
    
    res.status(200).json({ data: feedback });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
});

// Delete Feedback (User can delete their own, Admin can delete any)
app.delete('/api/feedback/:id', authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if user owns this feedback or is admin
    if (feedback.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own feedback.' });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    
    console.log(`🗑️ Feedback deleted by ${req.user.email}`);
    
    res.status(200).json({ message: 'Feedback deleted successfully' });
    
  } catch (error) {
    res.status(500).json({ message: 'Error deleting feedback', error: error.message });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get All Users (Admin Only)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      count: users.length,
      data: users
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get Stats (Admin Only)
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFeedbacks = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rateOurFriendship' } } }
    ]);
    
    res.status(200).json({
      totalUsers,
      totalFeedbacks,
      averageRating: avgRating[0]?.avgRating?.toFixed(1) || 0
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('============================================');
  console.log(`🚀 Dhruvi Feedback Server v2.0 is running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('============================================');
  console.log('👑 Admin Credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('============================================');
});