import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/auth';
import type { AuthUser } from '@large-event/api';
import { useInstance } from '../lib/instance-context';
import type { InstanceResponse as Instance } from '@large-event/api-types';
import ProtectedTeamPortal from '../components/ProtectedTeamPortal';

function TeamDDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { instances, loading, error, currentInstance, setCurrentInstance } = useInstance();

  useEffect(() => {
    const authUser = getCurrentUser();
    setUser(authUser);
  }, []);

  // Filter instances to only show admin portal access (web_admin or both)
  const adminInstances = instances.filter(
    (instance) => instance.accessLevel === 'web_admin' || instance.accessLevel === 'both'
  );

  // Group instances by owner organization
  const instancesByOrg = adminInstances.reduce((acc, instance) => {
    const orgName = instance.ownerOrganization.name;
    if (!acc[orgName]) {
      acc[orgName] = [];
    }
    acc[orgName].push(instance);
    return acc;
  }, {} as Record<string, Instance[]>);

  return (
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
          Team D - Select an Organization
        </h2>
        <p style={{
          fontSize: '1.1rem',
          color: '#666'
        }}>
          Choose an organization dashboard to manage
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

      {!loading && !error && adminInstances.length === 0 && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '20px',
          color: '#856404',
          textAlign: 'center'
        }}>
          <strong>No admin access available.</strong> You need admin portal access to view this page.
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
                    onClick={() => setCurrentInstance(instance)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '2px solid #e9ecef',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6f42c1';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(111, 66, 193, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e9ecef';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h4 style={{
                      margin: '0 0 10px 0',
                      color: '#6f42c1',
                      fontSize: '1.25rem'
                    }}>
                      {instance.name}
                    </h4>
                    <div style={{
                      borderTop: '1px solid #e9ecef',
                      paddingTop: '15px',
                      marginTop: '15px'
                    }}>
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.85rem',
                        color: '#495057',
                        fontWeight: 'bold'
                      }}>
                        Owner: {instance.ownerOrganization.acronym || instance.ownerOrganization.name}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: '#6c757d'
                      }}>
                        Access: {instance.accessLevel === 'both' ? 'Full Access' : instance.accessLevel === 'web_admin' ? 'Admin Portal' : 'User Portal'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {currentInstance && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#28a745',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '300px'
        }}>
          <strong>Selected:</strong> {currentInstance.name}
        </div>
      )}
    </main>
  );
}

function Home() {
  return (
    <ProtectedTeamPortal>
      <TeamDDashboard />
    </ProtectedTeamPortal>
  );
}

export const Route = createFileRoute('/')({
  component: Home,
});
