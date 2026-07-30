import React, { useState } from 'react';
import API from './api';

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setForm({ username: '', password: '', email: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const res = await API.post('/auth/login', { username: form.username, password: form.password });
                localStorage.setItem('token', res.data.token);
                onLoginSuccess();
            } else {
                await API.post('/auth/signup', form);
                alert("Account created successfully! Please log in.");
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data || "Authentication failed.");
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            
            {/* Top Navbar Header */}
            <nav style={{
                backgroundColor: '#4F46E5',
                color: 'white',
                padding: '15px 30px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                    Personal Finance Tracker
                </h1>
            </nav>

            {/* Login / Register Card Container */}
            <div style={{
                maxWidth: '400px',
                margin: '60px auto',
                padding: '30px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <h2 style={{ textAlign: 'center', marginTop: 0, color: '#111827' }}>
                    {isLogin ? 'Login' : 'Register'}
                </h2>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={form.username}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                        onChange={e => setForm({...form, username: e.target.value})} 
                        required 
                    />
                    {!isLogin && (
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            value={form.email}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                            onChange={e => setForm({...form, email: e.target.value})} 
                            required 
                        />
                    )}
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={form.password}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} 
                        onChange={e => setForm({...form, password: e.target.value})} 
                        required 
                    />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLogin ? 'Sign In' : 'Register'}
                    </button>
                </form>

                <p onClick={toggleMode} style={{ cursor: 'pointer', color: '#4F46E5', marginTop: '15px', textAlign: 'center' }}>
                    {isLogin ? "New user? Create an account" : 'Already registered? Log in'}
                </p>
            </div>
        </div>
    );
};

export default Login;