export default function Home() {
  return (
    <main>
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#333',
          marginBottom: '20px'
        }}>
          Hi this is Team D web-admin
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Welcome to the Team D Administrative Dashboard
        </p>
        <div style={{
          backgroundColor: '#e7f3ff',
          padding: '20px',
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <p style={{ margin: 0, color: '#0066cc' }}>
            🚀 This app is running on port 3001 and ready for development!
          </p>
        </div>
      </div>
    </main>
  )
}