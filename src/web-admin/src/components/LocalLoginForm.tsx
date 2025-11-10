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

  // Seed users for quick access
  const seedUsers = [
    { email: 'admin@system.com', label: 'System Admin', badge: 'All Access' },
    { email: 'admin@mes.dev', label: 'MES Admin', badge: 'MES Org' },
    { email: 'admin@cfes.dev', label: 'CFES Admin', badge: 'CFES Org' },
    { email: 'admin@cale.dev', label: 'CALE Admin', badge: 'CALE Org' },
    { email: 'admin@fireball.dev', label: 'Fireball Admin', badge: 'Fireball Only' },
    { email: 'admin@toga.dev', label: 'Toga Admin', badge: 'Toga Only' },
    { email: 'admin@grad.dev', label: 'Grad Admin', badge: 'Grad Only' },
    { email: 'admin@graffiti.dev', label: 'Graffiti Admin', badge: 'Graffiti Only' },
    { email: 'admin@natsurvey.dev', label: 'NatSurvey Admin', badge: 'Survey Only' },
    { email: 'admin@cale2026.dev', label: 'CALE 2026 Admin', badge: 'CALE 2026 Only' },
    { email: 'user@mes.dev', label: 'MES User', badge: 'User Portal' },
    { email: 'user@cfes.dev', label: 'CFES User', badge: 'User Portal' },
    { email: 'user@cale.dev', label: 'CALE User', badge: 'User Portal' },
  ];

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      maxWidth: '600px',
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

      {/* Quick User Selector */}
      <div style={{
        marginTop: '25px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <h3 style={{
          color: '#495057',
          fontSize: '0.9rem',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Quick Login (Development)
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {seedUsers.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => quickLogin(user.email)}
              disabled={loading}
              style={{
                padding: '8px 10px',
                backgroundColor: email === user.email ? '#e7f3ff' : '#f8f9fa',
                border: email === user.email ? '2px solid #0066cc' : '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontSize: '0.75rem',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && email !== user.email) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }
              }}
              onMouseLeave={(e) => {
                if (email !== user.email) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }
              }}
            >
              <div style={{ fontWeight: '600', color: '#212529', marginBottom: '2px' }}>
                {user.label}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#6c757d',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.email}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: '#6f42c1',
                fontWeight: '500',
                marginTop: '3px'
              }}>
                {user.badge}
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}