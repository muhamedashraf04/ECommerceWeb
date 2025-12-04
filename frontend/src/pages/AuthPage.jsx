// src/pages/AuthPage.jsx
import { useState } from 'react';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import Logo from '../images/finalHighQuality.png'; // Ensure this path is correct!

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

export default function AuthPage(){
    const [isLogin, setIsLogin]=useState(true); //if the user is logging in then it's true, if he's signing up then it's false
    return (
    <div className={styles.container}>
        
        {/* THE MAIN BIG FLOATING CARD */}
        <div className={styles.mainCard}>
        
        {/* LEFT SIDE (Inside the card): Text & Logo */}
        <div className={styles.infoSection}>
            <div className={styles.brand}>
                <img src={Logo} alt="Nile Logo" className={styles.logoImage} />
            </div>
        
            <h1 className={styles.heroTitle}>
                Your Favorite <br /> E-commerce Store
            </h1>
            <p className={styles.heroSubtitle}>
                Join thousands of happy customers. Discover amazing products, great deals, and fast delivery.
            </p>
        </div>

        {/* RIGHT SIDE (Inside the card): The White Login Form */}
        <div className={styles.formSection}>
            <div className={styles.whiteFormCard}>
            
                {/* Tabs */}
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`} 
                        onClick={() => setIsLogin(true)}
                    >
                    Sign In
                    </button>
                    <button 
                        className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`} 
                        onClick={() => setIsLogin(false)}
                    >
                    Sign Up
                    </button>
                </div>

                <h2>{isLogin ? 'Welcome back' : 'Create Account'}</h2>
                <p className={styles.subText}>
                    {isLogin ? 'Sign in to continue shopping' : 'Join us to start shopping'}
                </p>

            <form className={styles.form}>
                <div className={styles.inputGroup}>
                    <FaEnvelope className={styles.inputIcon} />
                    <input type="email" placeholder="you@example.com" />
                </div>

                <div className={styles.inputGroup}>
                    <FaLock className={styles.inputIcon} />
                    <input type="password" placeholder="Enter your password" />
                    {isLogin && <a href="#" className={styles.forgotPass}>Forgot?</a>}
                </div>

                {isLogin && (
                    <div className={styles.rememberRow}>
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                    </div>
                )}

                <button type="button" className={styles.submitBtn}>
                    {isLogin ? 'Sign In' : 'Sign Up'} &rarr;
                </button>
            </form>

            <div className={styles.divider}>Or continue with</div>

            <div className={styles.socialButtons}>
                <button className={styles.socialBtn}><FaGoogle /> Google</button>
                <button className={styles.socialBtn}><FaFacebookF /> Facebook</button>
            </div>

            </div>
        </div>
        </div>
    </div>
    );
};

export default AuthPage;