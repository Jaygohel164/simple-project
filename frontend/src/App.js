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
  buttonSecondary: {
    width: '100%',
    padding: '15px',
    background: '#e0e0e0',
    color: '#333',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '10px',
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
    flexWrap: 'wrap',
  },
  tab: {
    padding: '12px 25px',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: '15px',
    padding: '10px',
    background: '#fdeaea',
    borderRadius: '8px',
  },
  success: {
    color: '#27ae60',
    textAlign: 'center',
    marginBottom: '15px',
    padding: '10px',
    background: '#eafaf1',
    borderRadius: '8px',
  },
  userInfo: {
    textAlign: 'center',
    marginBottom: '20px',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    color: 'white',
  },
  adminBadge: {
    display: 'inline-block',
    padding: '5px 15px',
    background: '#f1c40f',
    color: '#333',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '15px',
    color: 'white',
    minWidth: '120px',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: '0.9',
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
  linkText: {
    color: '#764ba2',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // UI State
  const [activeTab, setActiveTab] = useState('form');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Form State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [feedbackForm, setFeedbackForm] = useState({
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
  
  // Data State
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  
  // UI Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Backend URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // ============================================
  // EFFECTS
  // ============================================
  
  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && activeTab === 'responses') {
      fetchFeedbacks();
    }
    if (isLoggedIn && user?.role === 'admin' && activeTab === 'responses') {
      fetchStats();
    }
  }, [activeTab, isLoggedIn]);

  // ============================================
  // API FUNCTIONS
  // ============================================

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      setIsLoggedIn(true);
    } catch (error) {
      localStorage.removeItem('token');
      setToken('');
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, loginForm);
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);
      setSuccess('Login successful! 🎉');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsLoggedIn(true);
      setSuccess('Registration successful! 🎉');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('form');
    setFeedbacks([]);
    setStats(null);
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'admin' ? '/api/feedback/all' : '/api/feedback/my';
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(response.data.data);
    } catch (error) {
      setError('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/feedback`, feedbackForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setFeedbackForm({
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
      setError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/feedback/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(feedbacks.filter(f => f._id !== id));
      setSuccess('Feedback deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to delete feedback');
    }
  };

  // ============================================
  // RENDER: LOGIN/REGISTER
  // ============================================
  
  if (!isLoggedIn) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>💖 About Dhruvi</h1>
          <p style={styles.subtitle}>
            {authMode === 'login' ? 'Login to share your thoughts' : 'Create an account to get started'}
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>{success}</div>}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={styles.authContainer}>
              <div style={styles.questionGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.questionGroup}>
                <label style={styles.label}>🔒 Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="Enter your password"
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? '⏳ Logging in...' : '🚀 Login'}
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Don't have an account?{' '}
                <span style={styles.linkText} onClick={() => setAuthMode('register')}>
                  Register here
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={styles.authContainer}>
              <div style={styles.questionGroup}>
                <label style={styles.label}>👤 Your Name</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  placeholder="Enter your name"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.questionGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  placeholder="Enter your email"
                  style={styles.input}
                  required
                />
              </div>
              
              <div style={styles.questionGroup}>
                <label style={styles.label}>🔒 Password (min 6 characters)</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  placeholder="Create a password"
                  style={styles.input}
                  minLength={6}
                  required
                />
              </div>
              
              <div style={styles.questionGroup}>
                <label style={styles.label}>🔒 Confirm Password</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  style={styles.input}
                  required
                />
              </div>

              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? '⏳ Creating account...' : '🎉 Register'}
              </button>
              
              <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account?{' '}
                <span style={styles.linkText} onClick={() => setAuthMode('login')}>
                  Login here
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: SUCCESS MESSAGE
  // ============================================
  
  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
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
  // RENDER: MAIN APP (Logged In)
  // ============================================
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* User Info Bar */}
        <div style={styles.userInfo}>
          <span>👋 Welcome, {user?.name}!</span>
          {user?.role === 'admin' && <span style={styles.adminBadge}>👑 ADMIN</span>}
          <button 
            onClick={handleLogout}
            style={{
              marginLeft: '15px',
              padding: '5px 15px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid white',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {/* Title */}
        <h1 style={styles.title}>💖 About Dhruvi</h1>
        <p style={styles.subtitle}>
          Share your honest thoughts - it means a lot! 🌸
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

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
            💬 {user?.role === 'admin' ? 'All Responses' : 'My Responses'}
          </button>
        </div>

        {/* FORM TAB */}
        {activeTab === 'form' && (
          <form onSubmit={handleSubmitFeedback}>
            <div style={styles.questionGroup}>
              <label style={styles.label}>💭 What do you think about Dhruvi?</label>
              <textarea
                value={feedbackForm.whatDoYouThink}
                onChange={(e) => setFeedbackForm({...feedbackForm, whatDoYouThink: e.target.value})}
                placeholder="Share your thoughts..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>🌟 What kind of person is Dhruvi?</label>
              <textarea
                value={feedbackForm.kindOfPerson}
                onChange={(e) => setFeedbackForm({...feedbackForm, kindOfPerson: e.target.value})}
                placeholder="Describe the kind of person you see..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>✨ What are Dhruvi's positive qualities?</label>
              <textarea
                value={feedbackForm.positiveThings}
                onChange={(e) => setFeedbackForm({...feedbackForm, positiveThings: e.target.value})}
                placeholder="List the good things..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>🔧 What should Dhruvi improve? (Be honest!)</label>
              <textarea
                value={feedbackForm.negativeThings}
                onChange={(e) => setFeedbackForm({...feedbackForm, negativeThings: e.target.value})}
                placeholder="Areas for improvement..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>🌺 How would you describe Dhruvi's nature?</label>
              <textarea
                value={feedbackForm.nature}
                onChange={(e) => setFeedbackForm({...feedbackForm, nature: e.target.value})}
                placeholder="Calm? Energetic? Kind? Funny?..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>💡 Any advice for Dhruvi?</label>
              <textarea
                value={feedbackForm.adviceForMe}
                onChange={(e) => setFeedbackForm({...feedbackForm, adviceForMe: e.target.value})}
                placeholder="Share your wisdom..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>📸 A favorite memory with Dhruvi?</label>
              <textarea
                value={feedbackForm.memoryWithMe}
                onChange={(e) => setFeedbackForm({...feedbackForm, memoryWithMe: e.target.value})}
                placeholder="Share a special moment..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>⭐ Rate your friendship (1-10)</label>
              <div style={styles.ratingContainer}>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={feedbackForm.rateOurFriendship}
                  onChange={(e) => setFeedbackForm({...feedbackForm, rateOurFriendship: parseInt(e.target.value)})}
                  style={{ flex: 1 }}
                />
                <span style={styles.ratingValue}>{feedbackForm.rateOurFriendship}/10</span>
              </div>
            </div>

            <div style={styles.questionGroup}>
              <label style={styles.label}>💌 Anything else you want to say?</label>
              <textarea
                value={feedbackForm.additionalMessage}
                onChange={(e) => setFeedbackForm({...feedbackForm, additionalMessage: e.target.value})}
                placeholder="Optional: Any additional thoughts..."
                style={styles.textarea}
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '⏳ Submitting...' : '💖 Submit Feedback'}
            </button>
          </form>
        )}

        {/* RESPONSES TAB */}
        {activeTab === 'responses' && (
          <div>
            {/* Admin Stats */}
            {user?.role === 'admin' && stats && (
              <div style={styles.statsCard}>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{stats.totalUsers}</div>
                  <div style={styles.statLabel}>Total Users</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{stats.totalFeedbacks}</div>
                  <div style={styles.statLabel}>Total Feedbacks</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statNumber}>{stats.averageRating}⭐</div>
                  <div style={styles.statLabel}>Avg Rating</div>
                </div>
              </div>
            )}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading responses... ⏳</p>
            ) : feedbacks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>
                {user?.role === 'admin' 
                  ? 'No feedbacks yet. Share the app with friends! 🌸' 
                  : "You haven't submitted any feedback yet. Fill the form above! 🌸"
                }
              </p>
            ) : (
              feedbacks.map((feedback, index) => (
                <div key={feedback._id || index} style={styles.feedbackCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#764ba2', margin: 0 }}>
                      💬 {user?.role === 'admin' ? `From: ${feedback.userName}` : 'Your Feedback'}
                    </h3>
                    <button
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      style={{
                        padding: '5px 15px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '10px' }}>
                      📧 {feedback.userEmail}
                    </p>
                  )}
                  
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
                    📅 {new Date(feedback.createdAt).toLocaleString()}
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