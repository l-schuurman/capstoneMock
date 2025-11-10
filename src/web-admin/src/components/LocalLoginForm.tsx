import { useState } from 'react';
import { AuthUser } from '../lib/auth';

interface LocalLoginFormProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export default function LocalLoginForm({ onLoginSuccess }: LocalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store local auth
        sessionStorage.setItem('teamd-auth-user', JSON.stringify(data.data.user));
        sessionStorage.setItem('teamd-auth-token', data.data.token);
        sessionStorage.setItem('teamd-auth-source', 'local');

        onLoginSuccess(data.data.user, data.data.token);
      } else {
        setError(data.error?.message || data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
      console.error('Local login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (userEmail: string) => {
    setEmail(userEmail);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '400px',
      width: '100%'
    }}>
      <h2 style={{
        color: '#6f42c1',
        marginBottom: '20px',
        fontSize: '1.5rem',
        textAlign: 'center'
      }}>
        TeamD Local Development
      </h2>

      <p style={{
        color: '#666',
        fontSize: '0.9rem',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        Quick login for local development (no main portal required)
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Enter your TeamD email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Logging in...' : 'Login to TeamD'}
        </button>

        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '0.85rem',
            marginTop: '10px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </form>

    </div>
  );
}