import { useState } from 'react';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from 'react-icons/fa';
import styles from './CartPage.module.css';
import Logo from '../images/finalHighQuality.png';
import wirelessHeadphones from '../images/Wireless Headphones.png';
import usbCable from '../images/USB-C Cable.png';
import phoneCase from '../images/Phone case.png';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Wireless Headphones', price: 79.99, quantity: 1, image: wirelessHeadphones },
    { id: 2, name: 'USB-C Cable', price: 12.99, quantity: 2, image: usbCable },
    { id: 3, name: 'Phone Case', price: 24.99, quantity: 1, image: phoneCase },
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* LEFT SIDE: Branding */}
        <div className={styles.leftSide}>
          <div className={styles.brand}>
            <img src={Logo} alt="Brand Logo" className={styles.logoImage}></img>
          </div>
          <h1 className={styles.heroTitle}>
            Your Shopping Cart
          </h1>
          <p className={styles.heroSubtitle}>
            Review your items, update quantities, and proceed to checkout. Fast delivery guaranteed on all orders.
          </p>
        </div>

        {/* RIGHT SIDE: Cart Content */}
        <div className={styles.rightSide}>
          <div className={styles.cartCard}>
            {/* Header */}
            <div className={styles.cartHeader}>
              <FaShoppingCart className={styles.cartIcon} />
              <h2>Shopping Cart</h2>
            </div>
            <p className={styles.subText}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
            </p>

            {/* Cart Items */}
            <div className={styles.itemsContainer}>
              {cartItems.length > 0 ? (
                cartItems.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3>
                      <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                    </div>
                    <div className={styles.quantityControl}>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FaMinus />
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button
                        className={styles.quantityBtn}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
                    <div className={styles.itemTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyCart}>
                  <FaShoppingCart className={styles.emptyIcon} />
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>

            {/* Summary */}
            {cartItems.length > 0 && (
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Subtotal</span>
                  <span className={styles.summaryValue}>${subtotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Tax (10%)</span>
                  <span className={styles.summaryValue}>${tax.toFixed(2)}</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.total}`}>
                  <span className={styles.summaryLabel}>Total</span>
                  <span className={styles.summaryValue}>${total.toFixed(2)}</span>
                </div>
                <button className={styles.checkoutBtn}>
                  <FaShoppingCart />
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
