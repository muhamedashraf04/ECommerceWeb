import { useState } from 'react';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import Logo from '../images/finalHighQuality.png'; 
import axios from 'axios';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isVendor, setIsVendor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        companyName: '',
        nationalIdImage: null
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
        setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!isLogin) {
            if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
            if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone Number is required";
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
            
            if (isVendor) {
                if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
                if (!formData.nationalIdImage) newErrors.nationalIdImage = "National ID Image is required";
            }
        }
        
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSocialLogin = (provider) => {
        console.log(`Logging in with ${provider}`);
        // Implement social login logic here
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Replace with your actual API endpoint
            // const response = await axios.post(isLogin ? '/api/login' : '/api/register', formData);
            console.log("Form Data:", formData);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert(`Success! Welcome ${isLogin ? 'back' : ''}, ${formData.email}`);
            // localStorage.setItem('token', response.data.token);
        } catch (error) {
            alert(error.message || "An error occurred"); 
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
                                <>
                                    <div className={styles.roleSelection}>
                                        <label>I am a:</label>
                                        <div className={styles.roleButtons}>
                                            <button 
                                                type="button" 
                                                className={`${styles.roleBtn} ${!isVendor ? styles.activeRole : ''}`}
                                                onClick={() => setIsVendor(false)}
                                            >
                                                Customer
                                            </button>
                                            <button 
                                                type="button" 
                                                className={`${styles.roleBtn} ${isVendor ? styles.activeRole : ''}`}
                                                onClick={() => setIsVendor(true)}
                                            >
                                                Vendor
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Full Name</label>
                                        <div className={styles.inputWrapper}>
                                            <FaUser className={styles.inputIcon} />
                                            <input 
                                                type="text" 
                                                name="fullName" 
                                                placeholder="Full Name" 
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                style={{ borderColor: errors.fullName ? 'red' : '#e2e8f0' }}
                                            />
                                        </div>
                                        {errors.fullName && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.fullName}</span>}
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Phone Number</label>
                                        <div className={styles.inputWrapper}>
                                            <FaPhone className={styles.inputIcon} />
                                            <input 
                                                type="tel" 
                                                name="phoneNumber" 
                                                placeholder="Phone Number" 
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                style={{ borderColor: errors.phoneNumber ? 'red' : '#e2e8f0' }}
                                            />
                                        </div>
                                        {errors.phoneNumber && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.phoneNumber}</span>}
                                    </div>

                                    {isVendor && (
                                        <>
                                            <div className={styles.inputGroup}>
                                                <label className={styles.inputLabel}>Company Name</label>
                                                <div className={styles.inputWrapper}>
                                                    <FaBuilding className={styles.inputIcon} />
                                                    <input 
                                                        type="text" 
                                                        name="companyName" 
                                                        placeholder="Company Name" 
                                                        value={formData.companyName}
                                                        onChange={handleChange}
                                                        style={{ borderColor: errors.companyName ? 'red' : '#e2e8f0' }}
                                                    />
                                                </div>
                                                {errors.companyName && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.companyName}</span>}
                                            </div>

                                            <div className={styles.inputGroup}>
                                                <label className={styles.inputLabel}>National ID Image</label>
                                                <div className={styles.inputWrapper}>
                                                    <FaIdCard className={styles.inputIcon} />
                                                    <div className={styles.fileInputWrapper}>
                                                        <input 
                                                            type="file" 
                                                            id="nationalIdImage"
                                                            name="nationalIdImage" 
                                                            accept="image/*"
                                                            onChange={handleChange}
                                                            style={{ borderColor: errors.nationalIdImage ? 'red' : '#e2e8f0' }}
                                                        />
                                                    </div>
                                                </div>
                                                {errors.nationalIdImage && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.nationalIdImage}</span>}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Email Address</label>
                                <div className={styles.inputWrapper}>
                                    <FaEnvelope className={styles.inputIcon} />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="you@example.com" 
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{ borderColor: errors.email ? 'red' : '#e2e8f0' }}
                                    />
                                </div>
                                {errors.email && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.email}</span>}
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Password</label>
                                <div className={styles.inputWrapper}>
                                    <FaLock className={styles.inputIcon} />
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="password" 
                                        placeholder="Password" 
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{ borderColor: errors.password ? 'red' : '#e2e8f0' }}
                                    />
                                    <button 
                                        type="button"
                                        className={styles.eyeBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {errors.password && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.password}</span>}
                                {isLogin && <a href="#" className={styles.forgotPass}>Forgot?</a>}
                            </div>

                            {!isLogin && (
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Confirm Password</label>
                                    <div className={styles.inputWrapper}>
                                        <FaLock className={styles.inputIcon} />
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"} 
                                            name="confirmPassword" 
                                            placeholder="Re-enter Password" 
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            style={{ borderColor: errors.confirmPassword ? 'red' : '#e2e8f0' }}
                                        />
                                        <button 
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <span style={{color: 'red', fontSize: '12px', marginLeft: '5px'}}>{errors.confirmPassword}</span>}
                                </div>
                            )}

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
                                className={`${styles.socialBtn} ${styles.googleBtn}`}
                                onClick={() => handleSocialLogin('Google')}
                                disabled={isLoading}
                            >
                                <FaGoogle /> Google
                            </button>
                            <button 
                                type="button" 
                                className={`${styles.socialBtn} ${styles.facebookBtn}`}
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
}