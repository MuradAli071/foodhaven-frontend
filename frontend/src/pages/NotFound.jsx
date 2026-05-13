import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="form-section">
      <div className="page-header">
        <div className="form-icon">🔍</div>
        <h2>404</h2>
        <p>Page not found. The page you're looking for doesn't exist.</p>
      </div>
      <Link className="btn-premium" to="/" style={{ position: 'relative', zIndex: 1, marginTop: '1rem' }}>
        Back to Home
      </Link>
    </section>
  );
}

export default NotFound;
