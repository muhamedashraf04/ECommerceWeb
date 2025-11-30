// src/layouts/MainLayout.jsx
import styles from './MainLayout.module.css'; // import the styles

const Navbar = () => (
  // Use className instead of style={{...}}
    <nav className={styles.navbar}>
    ShopVite Navbar
    </nav>
);

export const MainLayout = ({ children }) => {
    return (
    <div>
        <Navbar />

      {/* Apply the content class to the main wrapper */}
        <main className={styles.content}>
        {children}
        </main>
    </div>
    );
};