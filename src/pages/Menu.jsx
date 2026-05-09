import { useEffect, useState } from 'react';
import api from '../api/api';

function Menu({ addToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('/menu')
      .then((response) => {
        setItems(response.data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category))];
  const filteredItems = activeCategory === 'All' 
    ? items 
    : items.filter(item => item.category === activeCategory);

  if (loading) return <div className="container text-center mt-4"><h3>Refining the collection...</h3></div>;

  return (
    <div className="container mt-4 mb-4">
      <h2 className="section-title">The Culinary Collection</h2>
      
      <div className="category-tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card-grid">
        {filteredItems.map((item) => (
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
                <button 
                  className="button primary" 
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                >
                  {item.available ? 'Add to Cart' : 'Sold Out'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .category-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .tab-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 24px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }
        .tab-btn:hover, .tab-btn.active {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(251, 191, 36, 0.05);
        }
      `}</style>
    </div>
  );
}

export default Menu;
