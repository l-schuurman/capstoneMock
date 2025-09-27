'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, clearStoredAuth, checkMainPortalAuth, AuthUser } from '../lib/auth';

interface ProtectedTeamPortalProps {
  children: React.ReactNode;
}

function UnauthorizedAccess() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center'
    }}>
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
          🔒 Access Restricted
        </h1>
        <p style={{
          color: '#856404',
          marginBottom: '20px',
          fontSize: '1.1rem',
          lineHeight: '1.5'
        }}>
          This Team D portal requires authentication through the main admin portal.
        </p>
        <div style={{
          backgroundColor: '#e9ecef',
          padding: '15px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p style={{
            margin: '0 0 10px 0',
            color: '#495057',
            fontSize: '0.9rem'
          }}>
            Please log in through the main portal:
          </p>
          <a
            href="http://localhost:4001"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              display: 'block',
              marginBottom: '10px'
            }}
          >
            http://localhost:4001
          </a>
          <p style={{
            margin: 0,
            color: '#6c757d',
            fontSize: '0.8rem'
          }}>
            After logging in, use the "Team D Portal" button.
          </p>
        </div>

        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          padding: '15px',
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <p style={{
            margin: '0 0 10px 0',
            color: '#155724',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}>
            Debug Information:
          </p>
          <button
            onClick={async () => {
              console.log('Manual auth check triggered');
              const localUser = getCurrentUser();
              console.log('Local user:', localUser);

              if (localUser) {
                alert('Local session found: ' + localUser.email);
                window.location.reload();
                return;
              }

              // Check main portal
              console.log('Checking main portal...');
              const mainUser = await checkMainPortalAuth();
              if (mainUser) {
                alert('Found session from main portal: ' + mainUser.email);
                window.location.reload();
              } else {
                alert('No valid session found. Please log in through the main portal.');
              }
            }}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginRight: '10px'
            }}
          >
            Check Session
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              console.log('Session storage cleared');
              alert('Session storage cleared. Please log in again.');
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Clear Session
          </button>
        </div>
      </div>
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

      // If no local auth, check main portal
      console.log('No local auth, checking main portal...');
      const mainPortalUser = await checkMainPortalAuth();

      if (mainPortalUser) {
        setUser(mainPortalUser);
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

  if (!user) {
    return <UnauthorizedAccess />;
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
        <span style={{ color: '#155724', fontSize: '0.9rem' }}>
          ✅ Authenticated as: <strong>{user.email}</strong>
        </span>
        <button
          onClick={() => {
            clearStoredAuth();
            window.location.href = 'http://localhost:4001';
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
          Return to Main Portal
        </button>
      </div>
      {children}
    </div>
  );
}