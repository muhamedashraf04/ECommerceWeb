// src/layouts/MainLayout.jsx
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
    return (
        <main className={styles.content}>
            {children}
        </main>
    );
};

export default MainLayout;