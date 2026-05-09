import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

function Home() {
  const [settings, setSettings] = useState({});
  const [featuredItems, setFeaturedItems] = useState([]);

  useEffect(() => {
    // Fetch settings for hero background
    api.get('/settings')
      .then(res => setSettings(res.data))
      .catch(err => console.error('Failed to fetch settings', err));

    // Fetch menu items for "Flavors You'll Love"
    api.get('/menu')
      .then(res => {
        // Just take the first 4 items for display
        setFeaturedItems(res.data.slice(0, 4));
      })
      .catch(err => console.error('Failed to fetch menu', err));
  }, []);

  const heroBg = settings.heroBackgroundImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop';

  return (
    <>
      <section className="hero-v2">
        <div 
          className="hero-v2-bg" 
          style={{ backgroundImage: `url(${heroBg.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${heroBg}` : heroBg})` }}
        ></div>
        <div className="hero-v2-overlay"></div>
        
        <div className="hero-v2-content">
          <div className="badge-welcome">
            <span>🔥</span> WELCOME TO FOODHAVEN
          </div>
          
          <h1>Crafted Dining Experiences for every appetite.</h1>
          
          <div className="glass-card">
            <p>Order premium restaurant dishes online, browse curated menus, and manage your account — all in one seamless experience.</p>
          </div>
          
          <div className="hero-v2-actions">
            <Link to="/menu" className="btn-explore">
              Explore Menu →
            </Link>
            <Link to="/order" className="btn-view-cart">
              🛒 View Cart
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-flavors">
        <h2>🍕 Flavors You'll Love</h2>
        
        <div className="card-grid">
          {featuredItems.map((item) => (
            <article key={item._id} className="menu-card">
              {item.imageUrl && <img className="menu-card-image" src={item.imageUrl.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${item.imageUrl}` : item.imageUrl} alt={item.title} />}
              <div className="menu-card-body">
                <div className="menu-card-top">
                  <div style={{ textAlign: 'left' }}>
                    <h3>{item.title}</h3>
                    <p className="category">{item.category}</p>
                    {item.prepTime && (
                      <div className="prep-time">
                        <span>⏱️</span> {item.prepTime}
                      </div>
                    )}
                  </div>
                  <span className="price">Rs. {item.price.toLocaleString()}</span>
                </div>
                <p style={{ textAlign: 'left' }}>{item.description}</p>
              </div>
              <Link to="/menu" className="button primary" style={{ textDecoration: 'none' }}>
                View in Menu
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
