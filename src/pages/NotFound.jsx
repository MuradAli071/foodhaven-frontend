import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="section notfound-section">
      <div className="page-header">
        <h2>404</h2>
        <p>Page not found. Return to the homepage to continue ordering.</p>
      </div>
      <Link className="button primary" to="/">Go Home</Link>
    </section>
  );
}

export default NotFound;
