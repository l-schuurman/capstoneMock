export default function Home() {
  return (
    <main>
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#333',
          marginBottom: '20px'
        }}>
          Hi this is Team D web-user
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '30px'
        }}>
          Welcome to the Team D User Portal
        </p>
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '20px',
          borderRadius: '4px',
          border: '1px solid #b3e0b3'
        }}>
          <p style={{ margin: 0, color: '#006600' }}>
            🌟 This app is running on port 3002 and ready for development!
          </p>
        </div>
      </div>
    </main>
  )
}