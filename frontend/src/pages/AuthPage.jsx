import { useState } from 'react';
import { FaGoogle, FaFacebookF, FaLock, FaEnvelope, FaUser, FaPhone } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import Logo from '../images/finalHighQuality.png';

export default function AuthPage(){
    const [isLogin, setIsLogin]=useState(true); //if the user is logging in then it's true, if he's signing up then it's false
    return (
    
    <div className={styles.container}>
        <div className={styles.contentWrapper}>
        <div className={styles.leftSide}>
            <div className={styles.brand}>
                    <img src={Logo} alt="Brand Logo" className={styles.logoImage}></img>       
            </div>
            <h1 className={styles.heroTitle}>
            Your Favorite E-commerce Store
        </h1>
        <p className={styles.heroSubtitle}>
            Join thousands of happy customers. Discover amazing products, great deals, and fast delivery.
        </p>
        </div>

        {/* RIGHT SIDE: The Form */}
        <div className={styles.rightSide}>
            <div className={styles.authCard}>
        
            {/* Toggle Tabs */}
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
            {/* Name, and Phone number for Sign Up */}
            {!isLogin && (
              <>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input type="text" placeholder="First Name" />
                </div>
                <div className={styles.inputGroup}>
                  <FaUser className={styles.inputIcon} />
                  <input type="text" placeholder="Last Name" />
                </div>
                <div className={styles.inputGroup}>
                  <FaPhone className={styles.inputIcon} />
                  <input type="tel" placeholder="Phone Number" />
                </div>
              </>
            )}
            {/* Email Input */}
            <div className={styles.inputGroup}>
                <FaEnvelope className={styles.inputIcon} />
                <input type="email" placeholder="you@example.com" />
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input type="password" placeholder="Enter your password" />
                {isLogin && <a href="#" className={styles.forgotPass}>Forgot?</a>}
            </div>

            {/* Re-enter Password for Sign Up */}
            {!isLogin && (
              <div className={styles.inputGroup}>
                <FaLock className={styles.inputIcon} />
                <input type="password" placeholder="Re-enter your password" />
              </div>
            )}

            {/* Remember Me Checkbox */}
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
            <a href="https://accounts.google.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}><FaGoogle /> Google</a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialBtn}><FaFacebookF /> Facebook</a>
            </div>
        </div>
        </div>
        </div>
        </div>
    );
};