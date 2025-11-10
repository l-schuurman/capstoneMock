import { useState } from 'react';
import { AuthUser } from '../lib/auth';

interface LocalLoginFormProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export default function LocalLoginForm({ onLoginSuccess }: LocalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.user && data.data?.token) {
          // Store auth info
          sessionStorage.setItem('teamd-auth-user', JSON.stringify(data.data.user));
          sessionStorage.setItem('teamd-auth-token', data.data.token);
          sessionStorage.setItem('teamd-auth-source', 'local');

          onLoginSuccess(data.data.user, data.data.token);
        } else {
          setError('Invalid response from server');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error?.message || errorData.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
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
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '600px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          🚀 Local Development Login
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem'
        }}>
          Quick login for TeamD development
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? '#9ca3af' : '#17a2b8',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '500',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
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
              disabled={isLoading}
              style={{
                padding: '8px 10px',
                backgroundColor: email === user.email ? '#e7f3ff' : '#f8f9fa',
                border: email === user.email ? '2px solid #0066cc' : '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontSize: '0.75rem',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && email !== user.email) {
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