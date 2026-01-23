import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ============================================
// STYLES
// ============================================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Poppins', sans-serif",
    padding: '20px',
  },
  card: {
    maxWidth: '700px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: {
    textAlign: 'center',
    color: '#764ba2',
    fontSize: '2.5rem',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
  },
  questionGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px',
  },
  feedbackCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '15px',
    marginBottom: '20px',
    borderLeft: '4px solid #764ba2',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
    gap: '10px',
  },
  tab: {
    padding: '12px 30px',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  ratingValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#764ba2',
  },
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('form');
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    whatDoYouThink: '',
    kindOfPerson: '',
    positiveThings: '',
    negativeThings: '',
    nature: '',
    adviceForMe: '',
    memoryWithMe: '',
    rateOurFriendship: 5,
    additionalMessage: '',
  });

  // State for feedbacks list
  const [feedbacks, setFeedbacks] = useState([]);
  
  // State for submission status
  const [submitted, setSubmitted] = useState(false);
  
  // State for loading
  const [loading, setLoading] = useState(false);

  // Backend URL - Using environment variable or default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // ============================================
  // FETCH ALL FEEDBACKS
  // ============================================
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/feedback`);
      setFeedbacks(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setLoading(false);
    }
  };

  // Fetch feedbacks when viewing responses tab
  useEffect(() => {
    if (activeTab === 'responses') {
      fetchFeedbacks();
    }
  }, [activeTab]);

  // ============================================
  // HANDLE INPUT CHANGE
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ============================================
  // HANDLE FORM SUBMIT
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/feedback`, formData);
      console.log('Feedback submitted:', response.data);
      setSubmitted(true);
      setLoading(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: '',
          whatDoYouThink: '',
          kindOfPerson: '',
          positiveThings: '',
          negativeThings: '',
          nature: '',
          adviceForMe: '',
          memoryWithMe: '',
          rateOurFriendship: 5,
          additionalMessage: '',
        });
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
      setLoading(false);
    }
  };

  // ============================================
  // RENDER SUCCESS MESSAGE
  // ============================================
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successMessage}>
            <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>💖</h1>
            <h2 style={{ color: '#764ba2' }}>Thank You So Much!</h2>
            <p style={{ color: '#666', fontSize: '1.2rem' }}>
              Your feedback means the world to Dhruvi! 🌸
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Title */}
        <h1 style={styles.title}>💖 About Dhruvi</h1>
        <p style={styles.subtitle}>
          Share your honest thoughts - it means a lot! 🌸
        </p>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              background: activeTab === 'form' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
              color: activeTab === 'form' ? 'white' : '#333',
            }}
            onClick={() => setActiveTab('form')}
          >
            📝 Give Feedback
          </button>
          <button
            style={{
              ...styles.tab,
              background: activeTab === 'responses' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
              color: activeTab === 'responses' ? 'white' : '#333',
            }}
            onClick={() => setActiveTab('responses')}
          >
            💬 View Responses
          </button>
        </div>

        {/* FORM TAB */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmit}>
            {/* Question 1: Name */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>👤 Your Name (or stay anonymous)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name..."
                style={styles.input}
                required
              />
            </div>

            {/* Question 2: What do you think about me */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>💭 What do you think about Dhruvi?</label>
              <textarea
                name="whatDoYouThink"
                value={formData.whatDoYouThink}
                onChange={handleChange}
                placeholder="Share your thoughts..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 3: Kind of person */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>🌟 What kind of person is Dhruvi?</label>
              <textarea
                name="kindOfPerson"
                value={formData.kindOfPerson}
                onChange={handleChange}
                placeholder="Describe the kind of person you see..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 4: Positive things */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>✨ What are Dhruvi's positive qualities?</label>
              <textarea
                name="positiveThings"
                value={formData.positiveThings}
                onChange={handleChange}
                placeholder="List the good things..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 5: Negative things */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>🔧 What should Dhruvi improve? (Be honest!)</label>
              <textarea
                name="negativeThings"
                value={formData.negativeThings}
                onChange={handleChange}
                placeholder="Areas for improvement..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 6: Nature */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>🌺 How would you describe Dhruvi's nature?</label>
              <textarea
                name="nature"
                value={formData.nature}
                onChange={handleChange}
                placeholder="Calm? Energetic? Kind? Funny?..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 7: Advice */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>💡 Any advice for Dhruvi?</label>
              <textarea
                name="adviceForMe"
                value={formData.adviceForMe}
                onChange={handleChange}
                placeholder="Share your wisdom..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 8: Memory */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>📸 A favorite memory with Dhruvi?</label>
              <textarea
                name="memoryWithMe"
                value={formData.memoryWithMe}
                onChange={handleChange}
                placeholder="Share a special moment..."
                style={styles.textarea}
                required
              />
            </div>

            {/* Question 9: Rating */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>⭐ Rate your friendship (1-10)</label>
              <div style={styles.ratingContainer}>
                <input
                  type="range"
                  name="rateOurFriendship"
                  min="1"
                  max="10"
                  value={formData.rateOurFriendship}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                />
                <span style={styles.ratingValue}>{formData.rateOurFriendship}/10</span>
              </div>
            </div>

            {/* Question 10: Additional */}
            <div style={styles.questionGroup}>
              <label style={styles.label}>💌 Anything else you want to say?</label>
              <textarea
                name="additionalMessage"
                value={formData.additionalMessage}
                onChange={handleChange}
                placeholder="Optional: Any additional thoughts..."
                style={styles.textarea}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '⏳ Submitting...' : '💖 Submit Feedback'}
            </button>
          </form>
        )}

        {/* RESPONSES TAB */}
        {activeTab === 'responses' && (
          <div>
            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading responses... ⏳</p>
            ) : feedbacks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>
                No feedbacks yet. Be the first! 🌸
              </p>
            ) : (
              feedbacks.map((feedback, index) => (
                <div key={feedback._id || index} style={styles.feedbackCard}>
                  <h3 style={{ color: '#764ba2', marginBottom: '15px' }}>
                    💬 From: {feedback.name}
                  </h3>
                  
                  <p><strong>What they think:</strong> {feedback.whatDoYouThink}</p>
                  <p><strong>Kind of person:</strong> {feedback.kindOfPerson}</p>
                  <p><strong>Positive things:</strong> {feedback.positiveThings}</p>
                  <p><strong>To improve:</strong> {feedback.negativeThings}</p>
                  <p><strong>Nature:</strong> {feedback.nature}</p>
                  <p><strong>Advice:</strong> {feedback.adviceForMe}</p>
                  <p><strong>Memory:</strong> {feedback.memoryWithMe}</p>
                  <p><strong>Friendship Rating:</strong> ⭐ {feedback.rateOurFriendship}/10</p>
                  {feedback.additionalMessage && (
                    <p><strong>Additional:</strong> {feedback.additionalMessage}</p>
                  )}
                  
                  <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '10px' }}>
                    📅 {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
