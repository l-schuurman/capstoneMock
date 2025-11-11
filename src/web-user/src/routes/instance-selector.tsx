import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import type { AuthUser } from '@large-event/api';
import { useInstance } from '../lib/instance-context';
import type { InstanceResponse as Instance } from '@large-event/api-types';
import ProtectedRoute from '../components/ProtectedRoute';

function InstanceSelectorPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { instances, loading, error, currentInstance, setCurrentInstance } = useInstance();

  useEffect(() => {
    const authUser = getCurrentUser();
    setUser(authUser);
  }, []);

  // Filter instances to only show user portal access (web_user or both)
  const userInstances = instances.filter(
    (instance) => instance.accessLevel === 'web_user' || instance.accessLevel === 'both'
  );

  // Group instances by owner organization
  const instancesByOrg = userInstances.reduce((acc, instance) => {
    const orgName = instance.ownerOrganization.name;
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(instance);
    return acc;
  }, {} as Record<string, Instance[]>);

  return (
    <ProtectedRoute>
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#333',
            marginBottom: '10px'
          }}>
            Hi {user?.email}
          </h1>
          <h2 style={{
            fontSize: '2rem',
            color: '#555',
            marginBottom: '20px'
          }}>
            Team D - Select an Event
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Choose an event portal to access
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading instances...
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '20px',
            color: '#c33',
            textAlign: 'center'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && userInstances.length === 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '20px',
            color: '#856404',
            textAlign: 'center'
          }}>
            <strong>No user access available.</strong> You need user portal access to view this page.
          </div>
        )}

        {!loading && !error && Object.keys(instancesByOrg).length > 0 && (
          <div>
            {Object.entries(instancesByOrg).map(([orgName, orgInstances]) => (
              <div key={orgName} style={{ marginBottom: '40px' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  color: '#495057',
                  marginBottom: '20px',
                  borderBottom: '2px solid #dee2e6',
                  paddingBottom: '10px'
                }}>
                  {orgName}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}>
                  {orgInstances.map((instance) => (
                    <div
                      key={instance.id}
                      style={{
                        backgroundColor: 'white',
                        border: currentInstance?.id === instance.id ? '3px solid #007bff' : '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: currentInstance?.id === instance.id
                          ? '0 4px 12px rgba(0,123,255,0.3)'
                          : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => setCurrentInstance(instance)}
                      onMouseEnter={(e) => {
                        if (currentInstance?.id !== instance.id) {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentInstance?.id !== instance.id) {
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <h4 style={{
                        fontSize: '1.25rem',
                        color: '#212529',
                        marginBottom: '10px',
                        fontWeight: '600'
                      }}>
                        {instance.name}
                      </h4>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.9rem',
                        color: '#6c757d'
                      }}>
                        <div>
                          <strong>Organization:</strong> {instance.ownerOrganization.name}
                          {instance.ownerOrganization.acronym && ` (${instance.ownerOrganization.acronym})`}
                        </div>
                        <div>
                          <strong>Access:</strong> {instance.accessLevel === 'both' ? 'Full Access' : instance.accessLevel === 'web_admin' ? 'Admin Portal' : 'User Portal'}
                        </div>
                      </div>
                      {currentInstance?.id === instance.id && (
                        <div style={{
                          marginTop: '15px',
                          padding: '8px',
                          backgroundColor: '#d1ecf1',
                          borderRadius: '4px',
                          color: '#0c5460',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          ✓ Currently Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

export const Route = createFileRoute('/instance-selector')({
  component: InstanceSelectorPage,
});
