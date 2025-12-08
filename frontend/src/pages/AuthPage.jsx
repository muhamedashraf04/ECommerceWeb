import { useState } from 'react';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import Logo from '../images/finalHighQuality.png'; 

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
        
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await apiCall();
            console.log("API Success:", response);
            alert(`Success! Welcome ${isLogin ? 'back' : ''}, ${formData.email}`);
            // localStorage.setItem('token', response.token);
        } catch (error) {
            alert(error.message || error); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.mainCard}>
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

                <div className={styles.formSection}>
                    <div className={styles.whiteFormCard}>
                    
                        <div className={styles.tabs}>
                            <button 
                                className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`} 
                                onClick={() => { setIsLogin(true); setErrors({}); }}
                            >
                                Sign In
                            </button>
                            <button 
                                className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`} 
                                onClick={() => { setIsLogin(false); setErrors({}); }}
                            >
                                Sign Up
                            </button>
                        </div>

                        <h2>{isLogin ? 'Welcome back' : 'Create Account'}</h2>
                        <p className={styles.subText}>
                            {isLogin ? 'Sign in to continue shopping' : 'Join us to start shopping'}
                        </p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            
                            {!isLogin && (
                                <div className={styles.inputGroup}>
                                    <FaUser className={styles.inputIcon} />
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        placeholder="Full Name" 
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        style={{ borderColor: errors.fullName ? 'red' : '#e2e8f0' }}
                                    />
                                    {errors.fullName && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.fullName}</span>}
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="you@example.com" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={{ borderColor: errors.email ? 'red' : '#e2e8f0' }}
                                />
                                {errors.email && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.email}</span>}
                            </div>

                            <div className={styles.inputGroup}>
                                <FaLock className={styles.inputIcon} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Enter your password" 
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ borderColor: errors.password ? 'red' : '#e2e8f0' }}
                                />
                                {errors.password && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.password}</span>}
                                {isLogin && <a href="#" className={styles.forgotPass}>Forgot?</a>}
                            </div>

                            {isLogin && (
                                <div className={styles.rememberRow}>
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className={styles.submitBtn}
                                disabled={isLoading}
                                style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            >
                                {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')} 
                                {!isLoading && ' →'}
                            </button>
                        </form>

                        <div className={styles.divider}>Or continue with</div>

                        <div className={styles.socialButtons}>
                            <button 
                                type="button" 
                                className={styles.socialBtn}
                                onClick={() => handleSocialLogin('Google')}
                                disabled={isLoading}
                            >
                                <FaGoogle /> Google
                            </button>
                            <button 
                                type="button" 
                                className={styles.socialBtn}
                                onClick={() => handleSocialLogin('Facebook')}
                                disabled={isLoading}
                            >
                                <FaFacebookF /> Facebook
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
