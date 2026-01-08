import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            console.log("Checking authentication...");
            // Try Retailer
            try {
                console.log("Checking retailer...");
                const res = await API.get('/retailers/me');
                console.log("Retailer response:", res.data);
                if (res.data) {
                    setUser(res.data);
                    setRole('retailer');
                    setLoading(false);
                    return;
                }
            } catch (e) { console.log("Not a retailer", e.response?.status); }

            // Try Wholesaler
            try {
                console.log("Checking wholesaler...");
                const res = await API.get('/wholesalers/me');
                console.log("Wholesaler response:", res.data);
                if (res.data) {
                    setUser(res.data);
                    setRole('wholesaler');
                    setLoading(false);
                    return;
                }
            } catch (e) { console.log("Not a wholesaler", e.response?.status); }

            // Try Consumer (via addresses as proxy)
            try {
                console.log("Checking consumer...");
                await API.get('/addresses');
                console.log("Consumer confirmed");
                setUser({ name: 'User' }); // We don't have a direct user profile endpoint for consumers yet
                setRole('consumer');
                setLoading(false);
                return;
            } catch (e) { console.log("Not a consumer", e.response?.status); }

        } catch (error) {
            console.log("Not logged in");
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = () => {
        // Redirect to backend logout
        window.location.href = 'http://localhost:8000/api/logout/google';
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
