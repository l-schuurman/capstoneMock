import { useEffect, useState } from 'react';
import { getCurrentUser, clearStoredAuth, checkSharedCookieAuth } from '../lib/auth';
import { broadcastLogout } from '../lib/cross-tab-auth';
import type { AuthUser } from '@large-event/api';
import LocalLoginForm from './LocalLoginForm';

interface ProtectedTeamPortalProps {
  children: React.ReactNode;
}

function UnauthorizedAccess({ onLocalLogin }: { onLocalLogin: (user: AuthUser, token: string) => void }) {
  const [showLocalLogin, setShowLocalLogin] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      gap: '20px'
    }}>
      {/* Local Login Form */}
      {showLocalLogin ? (
        <LocalLoginForm onLoginSuccess={onLocalLogin} />
      ) : (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            color: '#856404',
            marginBottom: '20px',
            fontSize: '1.8rem'
          }}>
            🔒 Authentication Required
          </h1>
          <p style={{
            color: '#856404',
            marginBottom: '20px',
            fontSize: '1.1rem',
            lineHeight: '1.5'
          }}>
            Choose your authentication method:
          </p>

          {/* Local Development Option */}
          <div style={{
            backgroundColor: '#d1ecf1',
            border: '1px solid #bee5eb',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#0c5460',
              margin: '0 0 10px 0',
              fontSize: '1.1rem'
            }}>
              🚀 Local Development
            </h3>
            <p style={{
              color: '#0c5460',
              margin: '0 0 15px 0',
              fontSize: '0.9rem'
            }}>
              Quick login for TeamD local development (no main portal required)
            </p>
            <button
              onClick={() => setShowLocalLogin(true)}
              style={{
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              Use Local Login
            </button>
          </div>

          {/* Main Portal Option */}
          <div style={{
            backgroundColor: '#e9ecef',
            padding: '20px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3 style={{
              color: '#495057',
              margin: '0 0 10px 0',
              fontSize: '1.1rem'
            }}>
              🌐 Main Portal
            </h3>
            <p style={{
              margin: '0 0 15px 0',
              color: '#495057',
              fontSize: '0.9rem'
            }}>
              Log in through the main admin portal for full access:
            </p>
            <a
              href="http://localhost:4001"
              style={{
                display: 'inline-block',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              Go to Main Portal
            </a>
            <p style={{
              margin: '10px 0 0 0',
              color: '#6c757d',
              fontSize: '0.8rem'
            }}>
              After logging in, use the "Team D Portal" button.
            </p>
          </div>

        </div>
      )}

      {/* Back Button for Local Login */}
      {showLocalLogin && (
        <button
          onClick={() => setShowLocalLogin(false)}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          ← Back to Auth Options
        </button>
      )}
    </div>
  );
}

export default function ProtectedTeamPortal({ children }: ProtectedTeamPortalProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking auth...'); // Debug log

      // First check local auth
      const currentUser = getCurrentUser();
      console.log('Current user:', currentUser); // Debug log

      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // If no local auth, check shared cookie
      console.log('No local auth, checking shared cookie...');
      const cookieUser = await checkSharedCookieAuth();

      if (cookieUser) {
        setUser(cookieUser);
      }

      setLoading(false);
    };

    // Check immediately
    checkAuth();

    // Listen for storage changes (if user logs out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'teamd-auth-user' && !e.newValue) {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  const handleLocalLogin = (authUser: AuthUser, token: string) => {
    console.log('Local login successful:', authUser);
    setUser(authUser);

    // Dispatch custom event to notify other components (like InstanceContext) that auth has changed
    window.dispatchEvent(new Event('teamd-auth-changed'));
  };

  if (!user) {
    return <UnauthorizedAccess onLocalLogin={handleLocalLogin} />;
  }

  return (
    <div>
      {/* Auth info header */}
      <div style={{
        backgroundColor: '#d4edda',
        borderBottom: '1px solid #c3e6cb',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#155724', fontSize: '0.9rem' }}>
            ✅ Authenticated as: <strong>{user.email}</strong>
          </span>
          <span style={{
            color: '#0c5460',
            fontSize: '0.8rem',
            backgroundColor: '#d1ecf1',
            padding: '2px 8px',
            borderRadius: '3px',
            border: '1px solid #bee5eb'
          }}>
            {sessionStorage.getItem('teamd-auth-source') === 'local' ? '🚀 Local Dev' : '🌐 Main Portal'}
          </span>
        </div>
        {sessionStorage.getItem('teamd-auth-source') === 'local' ? (
          <button
            onClick={async () => {
              try {
                // 1. Clear the HTTP-only cookie via API
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
              } catch (error) {
                console.error('Logout API failed:', error);
              } finally {
                // 2. Clear sessionStorage
                clearStoredAuth();
                // 3. Reload page
                window.location.reload();
              }
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={async () => {
              try {
                // 1. Logout from server to clear shared cookie
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include',
                });
              } catch (error) {
                console.error('Logout API failed:', error);
              } finally {
                // 2. Broadcast logout to other tabs (main portal)
                broadcastLogout();

                // 3. Clear all local session storage
                sessionStorage.removeItem('teamd-auth-user');
                sessionStorage.removeItem('teamd-auth-token');
                sessionStorage.removeItem('teamd-auth-source');
                sessionStorage.removeItem('teamd-current-instance');

                // 4. Try to close the tab (works if opened via window.open)
                window.close();

                // 5. Fallback: If tab didn't close, redirect after 100ms
                setTimeout(() => {
                  if (!window.closed) {
                    window.location.replace('http://localhost:4001');
                  }
                }, 100);
              }
            }}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Logout & Close
          </button>
        )}
      </div>
      {children}
    </div>
  );
}