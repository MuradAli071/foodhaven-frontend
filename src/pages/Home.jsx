import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function Home() {
  const [settings, setSettings] = useState({});
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to fetch settings', err));

    api.get('/menu')
      .then(res => setFeaturedItems(res.data.slice(0, 3)))
      .catch(err => console.error('Failed to fetch menu', err));
  }, []);

  const heroBg = settings.heroBackgroundImage || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop';

  return (
    <>
      <section className="hero-v3">
        <div 
          className="hero-v3-bg" 
          style={{ backgroundImage: `url(${heroBg.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${heroBg}` : heroBg})` }}
        ></div>
        <div className="hero-v3-overlay"></div>
        
        <div className="hero-v3-content">
          <h1 className="fade-in">Culinary Artistry <br/>Redefined.</h1>
          <p className="fade-in" style={{ animationDelay: '0.2s' }}>
            Experience the pinnacle of fine dining from the comfort of your home. 
            Exquisite flavors, professional service, and a digital experience crafted for connoisseurs.
          </p>
          <div className="fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/menu" className="btn-premium">
              EXPLORE THE COLLECTION
            </Link>
          </div>
        </div>
      </section>

      <section className="container mt-4 mb-4">
        <h2 className="section-title">Chef's Highlights</h2>
        <div className="card-grid">
          {featuredItems.map((item) => (
            <article key={item._id} className="premium-card fade-in">
              <div className="card-image-wrap">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${item.imageUrl}` : item.imageUrl} 
                    alt={item.title} 
                  />
                )}
                <span className="card-badge">{item.category}</span>
              </div>
              <div className="card-body">
                <div className="card-meta">
                  <h3>{item.title}</h3>
                  <span className="card-price">Rs. {item.price.toLocaleString()}</span>
                </div>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {item.description}
                </p>
                <div className="card-meta">
                  {item.prepTime && (
                    <div className="card-time">
                      <span>⏱️</span> {item.prepTime}
                    </div>
                  )}
                  <Link to="/menu" className="button primary">Order Now</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
