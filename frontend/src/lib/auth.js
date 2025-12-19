export const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Invalid token", error);
        return null;
    }
};

export const getVendorId = () => {
    const decoded = getDecodedToken();
    // Adjust the claim key based on your backend. 
    // Usually it's "nameid" or "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    return decoded ? (decoded.nameid || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]) : null;
};
