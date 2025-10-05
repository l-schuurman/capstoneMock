import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3114;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthUser {
  email: string;
  id?: number;
}

// Mock user database for development
const mockUsers: { [email: string]: AuthUser } = {
  'user@teamd.local': { email: 'user@teamd.local', id: 1 },
  'test@teamd.dev': { email: 'test@teamd.dev', id: 2 },
  'demo@teamd.local': { email: 'demo@teamd.local', id: 3 },
};

function validateUser(email: string): AuthUser | null {
  return mockUsers[email] || null;
}

function generateToken(user: AuthUser): string {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(token: string): { user: AuthUser } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { user: AuthUser };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3014',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Auth middleware
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  (req as any).user = decoded.user;
  next();
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = validateUser(email);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const token = generateToken(user);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 1000,
      path: '/'
    });

    res.json({
      success: true,
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth-token', { path: '/' });
  res.json({ success: true });
});

// Get current user endpoint
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: (req as any).user });
});

// Get token endpoint
app.get('/api/auth/token', authMiddleware, (req, res) => {
  const token = req.cookies['auth-token'];
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Team D User server running on http://localhost:${PORT}`);
});
