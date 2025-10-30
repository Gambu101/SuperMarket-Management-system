import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Sale.css';

const Sale = () => {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [confirmPurchase, setConfirmPurchase] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('/api/inventory', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInventory(response.data.sort((a, b) => a.product_name.localeCompare(b.product_name)));
        setFilteredInventory(response.data.sort((a, b) => a.product_name.localeCompare(b.product_name)));
      } catch (error) {
        console.error(error);
      }
    };
    fetchInventory();
  }, [token]);

  useEffect(() => {
    const filtered = inventory.filter((item) => {
      return item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const handleAddToCart = (product, quantity) => {
    if (cart[product.id]) {
      setCart({ ...cart, [product.id]: { ...cart[product.id], quantity: cart[product.id].quantity + quantity } });
    } else {
      setCart({ ...cart, [product.id]: { product, quantity } });
    }
  };

  const handleRemoveFromCart = (productId) => {
    delete cart[productId];
    setCart({ ...cart });
  };

  const handlePurchase = () => {
    setConfirmPurchase(true);
  };

  const handleConfirmPurchase = () => {
    // Implement purchase logic here
    console.log('Purchase confirmed:', cart);
    setConfirmPurchase(false);
    setCart({});
  };

  return (
    <div className="sale-container">
      <div className="product-list">
        <h1>Sale</h1>
        <input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredInventory.map((item) => (
            <li key={item.id} className="product-item">
              <span>{item.product_name} - ₦{item.price}</span>
              <input
                type="number"
                value={cart[item.id] ? cart[item.id].quantity : 0}
                onChange={(e) => handleAddToCart(item, parseInt(e.target.value))}
              />
              <button onClick={() => handleAddToCart(item, 1)}>+</button>
              <button onClick={() => handleAddToCart(item, -1)}>-</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="cart">
        <h2>Cart</h2>
        <ul>
          {Object.values(cart).map((item) => (
            <li key={item.product.id}>
              <span>{item.product.product_name} x {item.quantity} - ₦{item.product.price * item.quantity}</span>
              <button onClick={() => handleRemoveFromCart(item.product.id)}>x</button>
            </li>
          ))}
        </ul>
        <button onClick={handlePurchase}>Purchase</button>
      </div>
      {confirmPurchase && (
        <div className="confirm-purchase-modal">
          <div className="confirm-purchase-modal-content">
            <h2>Confirm Purchase</h2>
            <ul>
              {Object.values(cart).map((item) => (
                <li key={item.product.id}>
                  <span>{item.product.product_name} x {item.quantity} - ₦{item.product.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <button onClick={handleConfirmPurchase}>Confirm</button>
            <button onClick={() => setConfirmPurchase(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sale;
