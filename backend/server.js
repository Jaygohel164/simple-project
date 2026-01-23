// ============================================
// DHRUVI FEEDBACK APP - BACKEND SERVER
// ============================================

// Step 1: Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Step 2: Create Express application
const app = express();

// Step 3: Middleware Setup
// CORS: Allows frontend to communicate with backend
app.use(cors());
// Body Parser: Converts incoming JSON to JavaScript object
app.use(bodyParser.json());

// Step 4: MongoDB Connection
// We use environment variable so we can change it in Kubernetes
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dhruvifeedback';

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error);
  });

// Step 5: Define the Data Schema (Structure of our feedback)
const feedbackSchema = new mongoose.Schema({
  name: {
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

// Step 6: Create the Model (This is how we interact with the database)
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ============================================
// API ENDPOINTS (Routes)
// ============================================

// Route 1: Health Check - To verify server is running
app.get('/', (req, res) => {
  res.json({ 
    message: '🌸 Welcome to Dhruvi Feedback API!',
    status: 'Server is running successfully'
  });
});

// Route 2: Health check for Kubernetes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Route 3: Submit new feedback (CREATE)
app.post('/api/feedback', async (req, res) => {
  try {
    console.log('📩 Received new feedback:', req.body);
    
    // Create new feedback document
    const newFeedback = new Feedback({
      name: req.body.name,
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

    // Save to database
    const savedFeedback = await newFeedback.save();
    
    console.log('✅ Feedback saved successfully!');
    res.status(201).json({
      message: 'Thank you for your feedback! 💖',
      data: savedFeedback
    });

  } catch (error) {
    console.log('❌ Error saving feedback:', error);
    res.status(500).json({
      message: 'Error saving feedback',
      error: error.message
    });
  }
});

// Route 4: Get all feedbacks (READ)
app.get('/api/feedback', async (req, res) => {
  try {
    // Find all feedbacks, sort by newest first
    const allFeedbacks = await Feedback.find().sort({ createdAt: -1 });
    
    console.log(`📋 Retrieved ${allFeedbacks.length} feedbacks`);
    res.status(200).json({
      count: allFeedbacks.length,
      data: allFeedbacks
    });

  } catch (error) {
    console.log('❌ Error fetching feedbacks:', error);
    res.status(500).json({
      message: 'Error fetching feedbacks',
      error: error.message
    });
  }
});

// Route 5: Get single feedback by ID
app.get('/api/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.status(200).json({ data: feedback });

  } catch (error) {
    res.status(500).json({
      message: 'Error fetching feedback',
      error: error.message
    });
  }
});

// Route 6: Delete feedback
app.delete('/api/feedback/:id', async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!deletedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.status(200).json({
      message: 'Feedback deleted successfully',
      data: deletedFeedback
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error deleting feedback',
      error: error.message
    });
  }
});

// Step 7: Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('============================================');
  console.log(`🚀 Dhruvi Feedback Server is running!`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log('============================================');
});
