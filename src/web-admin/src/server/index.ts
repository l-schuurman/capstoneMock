import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3124;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: 'http://localhost:3024',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Local login (for testing without main portal)
app.post('/api/auth/local-login', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = { id: 1, email };
    const localSecret = 'teamd-local-secret';
    const token = jwt.sign({ user }, localSecret, { expiresIn: '24h' });

    res.json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('Local login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Team D Admin server running on http://localhost:${PORT}`);
});
