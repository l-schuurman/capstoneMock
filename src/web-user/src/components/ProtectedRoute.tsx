'use client';

import { useAuth } from '../contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            marginBottom: '20px',
            color: '#333'
          }}>
            Team D User Portal
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#666',
            marginBottom: '20px'
          }}>
            Please log in to access the Team D user dashboard.
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}