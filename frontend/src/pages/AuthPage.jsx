import { useState } from 'react';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import Logo from '../images/finalHighQuality.png'; 

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        if (!isLogin && !formData.fullName.trim()) {
            newErrors.fullName = "Full Name is required";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // ==========================================
    //  PHASE 4: API HANDLERS
    // ==========================================

    // FAKE BACKEND
    // This allows you to test the UI while waiting for the backend.
    const apiCall = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (formData.email === "test@error.com") {
                    reject("User not found. Please sign up.");
                } else {
                    resolve({ token: "fake-jwt-token-123", user: formData });
                }
            }, 2000); 
        });
    };

    /* // REAL BACKEND 
    //Replace 'https://your-api.com' with your actual server URL.

    const apiCall = async () => {
        const endpoint = isLogin ? "/login" : "/signup";
        const url = `https://your-api.com/api/auth${endpoint}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            // Throw error message from server (e.g., "Wrong Password")
            throw new Error(data.message || "Something went wrong");
        }

        return data; // Should return user token/data
    };
    */

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // This calls whichever 'apiCall' function is active above
            const response = await apiCall();
            
            console.log("API Success:", response);
            alert(`Success! Welcome ${isLogin ? 'back' : ''}, ${formData.email}`);
            
            // TODO: Save token to localStorage
            // localStorage.setItem('token', response.token);
            // navigate('/dashboard');

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