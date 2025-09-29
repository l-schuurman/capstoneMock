import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthToken {
  user: AuthUser;
  exp: number;
  iat: number;
}

export function verifyToken(token: string): AuthToken | null {
  try {
    // Try main portal JWT secret first
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    try {
      // Try local TeamD JWT secret
      const localSecret = 'teamd-local-secret';
      return jwt.verify(token, localSecret) as AuthToken;
    } catch (localError) {
      return null;
    }
  }
}

export function getAuthFromUrl(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  console.log('Current URL:', window.location.href); // Debug log
  const urlParams = new URLSearchParams(window.location.search);
  const authToken = urlParams.get('auth');
  console.log('Auth token from URL:', authToken); // Debug log

  if (!authToken) return null;

  const decoded = verifyToken(authToken);
  console.log('Decoded token:', decoded); // Debug log

  if (decoded?.user) {
    // Store the auth info in sessionStorage for persistence
    sessionStorage.setItem('teamd-auth-user', JSON.stringify(decoded.user));
    sessionStorage.setItem('teamd-auth-token', authToken);
    sessionStorage.setItem('teamd-auth-source', 'main');
    console.log('Stored auth to sessionStorage'); // Debug log

    // Clean up URL
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    console.log('Cleaned URL to:', newUrl); // Debug log
  }
  return decoded?.user || null;
}

export function getStoredAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = sessionStorage.getItem('teamd-auth-user');
    const storedToken = sessionStorage.getItem('teamd-auth-token');
    console.log('Stored user from sessionStorage:', storedUser); // Debug log
    console.log('Stored token from sessionStorage:', storedToken ? 'present' : 'missing'); // Debug log

    if (!storedUser || !storedToken) return null;

    // Verify token is still valid
    const decoded = verifyToken(storedToken);
    console.log('Decoded stored token:', decoded); // Debug log

    if (!decoded) {
      console.log('Token invalid, clearing storage'); // Debug log
      clearStoredAuth();
      return null;
    }

    const parsedUser = JSON.parse(storedUser);
    console.log('Returning parsed user:', parsedUser); // Debug log
    return parsedUser;
  } catch (error) {
    console.log('Error in getStoredAuth:', error); // Debug log
    clearStoredAuth();
    return null;
  }
}

export function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem('teamd-auth-user');
  sessionStorage.removeItem('teamd-auth-token');
}

export function getCurrentUser(): AuthUser | null {
  console.log('getCurrentUser called'); // Debug log

  // First try to get from URL (new session)
  const urlUser = getAuthFromUrl();
  console.log('URL user:', urlUser); // Debug log
  if (urlUser) return urlUser;

  // Then try stored session
  const storedUser = getStoredAuth();
  console.log('Stored user:', storedUser); // Debug log
  return storedUser;
}

export async function checkMainPortalAuth(): Promise<AuthUser | null> {
  try {
    console.log('Checking main portal auth...');
    const response = await fetch('http://localhost:4001/api/auth/token', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Main portal auth response:', data);

      if (data.user && data.token) {
        // Store the auth info locally
        sessionStorage.setItem('teamd-auth-user', JSON.stringify(data.user));
        sessionStorage.setItem('teamd-auth-token', data.token);
        sessionStorage.setItem('teamd-auth-source', 'main');
        console.log('Stored auth from main portal');
        return data.user;
      }
    } else {
      console.log('Main portal auth failed:', response.status);
    }
  } catch (error) {
    console.log('Error checking main portal auth:', error);
  }

  return null;
}