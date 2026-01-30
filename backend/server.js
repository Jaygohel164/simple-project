// ============================================
// DHRUVI FEEDBACK APP - BACKEND WITH MYSQL (SEQUELIZE)
// Version 3.0 - With RDS/MySQL Support
// ============================================

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// ============================================
// CONFIGURATION
// ============================================

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dhruvi-super-secret-key-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dhruvi@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dhruvi123';

// Database Configuration
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'dhruvifeedback';
const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(bodyParser.json());

// ============================================
// DATABASE CONNECTION (SEQUELIZE)
// ============================================

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test Connection and Sync Models
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL database successfully!');

    // Sync models (alter: true updates tables if they exist but schema changed)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized!');

    createAdminUser();
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    // Retry logic could go here
    setTimeout(connectDB, 5000);
  }
}

// ============================================
// MODELS
// ============================================

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
});

// Feedback Model
const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatDoYouThink: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  kindOfPerson: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  positiveThings: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  negativeThings: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nature: {
    type: DataTypes.TEXT, // Changed to TEXT for longer descriptions
    allowNull: false
  },
  adviceForMe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  memoryWithMe: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rateOurFriendship: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  additionalMessage: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Associations
User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ============================================
// HELPER FUNCTIONS
// ============================================

// Create Admin User on Startup
async function createAdminUser() {
  try {
    const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

      await User.create({
        name: 'Dhruvi (Admin)',
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin'
      });

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
      userId: user.id,
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
    message: '🌸 Welcome to Dhruvi Feedback API v3.0 (MySQL Edition)!',
    status: 'Server is running successfully',
    features: ['Authentication', 'User Roles', 'Protected Responses', 'MySQL/RDS Support']
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
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    // Generate token
    const token = generateToken(newUser);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful! 🎉',
      token,
      user: {
        id: newUser.id,
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
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
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
        id: user.id,
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
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

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

    const savedFeedback = await Feedback.create({
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
    const myFeedbacks = await Feedback.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });

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
    const allFeedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']]
    });

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
    const feedback = await Feedback.findByPk(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback or is admin
    // Note: userId in Sequelize is usually INT, in Token it might be string or int. safest to loose check or cast.
    if (feedback.userId != req.user.userId && req.user.role !== 'admin') {
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
    const feedback = await Feedback.findByPk(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback or is admin
    if (feedback.userId != req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own feedback.' });
    }

    await feedback.destroy();

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
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

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
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalFeedbacks = await Feedback.count();

    const avgRatingData = await Feedback.findAll({
      attributes: [[sequelize.fn('AVG', sequelize.col('rateOurFriendship')), 'avgRating']]
    });

    const avgRating = avgRatingData[0]?.dataValues.avgRating || 0;

    res.status(200).json({
      totalUsers,
      totalFeedbacks,
      averageRating: Number(avgRating).toFixed(1)
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, async () => {
  console.log('============================================');
  console.log(`🚀 Dhruvi Feedback Server v3.0 (MySQL) is running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('============================================');

  // Connect to DB after server starts
  await connectDB();

  console.log('👑 Admin Credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('============================================');
});