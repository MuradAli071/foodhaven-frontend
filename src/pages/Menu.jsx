import { useEffect, useState } from 'react';
import api from '../api/api';

function Menu({ addToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/menu')
      .then((response) => setItems(response.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="page-header">
        <h2>Our Menu</h2>
        <p>Explore seasonal specials and chef favorites from FoodHaven.</p>
      </div>
      {loading ? (
        <p>Loading menu items...</p>
      ) : items.length ? (
        <div className="card-grid">
          {items.map((item) => (
            <article key={item._id} className="menu-card">
              {item.imageUrl && <img className="menu-card-image" src={item.imageUrl} alt={item.title} />}
              <div className="menu-card-body">
                <div className="menu-card-top">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="category">{item.category}</p>
                  </div>
                  <span className="price">Rs. {item.price.toLocaleString()}</span>
                </div>
                <p>{item.description}</p>
              </div>
              <button className="button primary" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p>No menu items available right now. Check back soon.</p>
      )}
    </section>
  );
}

export default Menu;
