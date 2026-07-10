import React, { useState } from 'react';
import API from './api';

const Login = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');

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
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
            <h2 style={{ textAlign: 'center' }}>{isLogin ? 'Login' : 'Register'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Username" style={{ padding: '10px' }} onChange={e => setForm({...form, username: e.target.value})} required />
                {!isLogin && <input type="email" placeholder="Email Address" style={{ padding: '10px' }} onChange={e => setForm({...form, email: e.target.value})} required />}
                <input type="password" placeholder="Password" style={{ padding: '10px' }} onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLogin ? 'Sign In' : 'Register'}
                </button>
            </form>
            <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', color: '#4F46E5', marginTop: '15px', textAlign: 'center' }}>
                {isLogin ? "New user? Create an account" : 'Already registered? Log in'}
            </p>
        </div>
    );
};

export default Login;