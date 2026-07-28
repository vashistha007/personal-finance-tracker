import React, { useEffect, useState } from 'react';
import API from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
    const [transactions, setTransactions] = useState([]);
    const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', category: '', date: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        const res = await API.get('/transactions');
        setTransactions(res.data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            await API.put(`/transactions/${editingId}`, form);
            setEditingId(null);
        } else {
            await API.post('/transactions', form);
        }
        setForm({ description: '', amount: '', type: 'EXPENSE', category: '', date: '' });
        fetchTransactions();
    };

    const exportToCSV = () => {
    if (transactions.length === 0) {
        alert("Export karne ke liye koi data nahi hai!");
        return;
    }


    const headers = ["Description,Amount,Type,Category,Date\n"];

    // Saare transactions ko CSV rows mein convert karein
    const rows = transactions.map(tx => 
        `"${tx.description.replace(/"/g, '""')}",${tx.amount},"${tx.type}","${tx.category}","${tx.date}"`
    );

    
    const csvContent = headers.concat(rows.join("\n")).join("");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Monthly_Expense_Report_${new Date().toISOString().slice(0, 7)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

    const handleDelete = async (id) => {
        if (window.confirm("Delete record?")) {
            await API.delete(`/transactions/${id}`);
            fetchTransactions();
        }
    };

    const chartData = transactions.reduce((acc, curr) => {
        const found = acc.find(item => item.category === curr.category);
        const amt = parseFloat(curr.amount);
        if (found) {
            found.amount += curr.type === 'EXPENSE' ? amt : -amt;
        } else {
            acc.push({ category: curr.category, amount: curr.type === 'EXPENSE' ? amt : -amt });
        }
        return acc;
    }, []);

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📊 Financial Ledger</h2>
                <button onClick={exportToCSV} style={{ padding: '8px 16px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            📥 Export Report (CSV)
        </button>
                <button onClick={onLogout} style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: 'white', border: 'none', cursor: 'pointer' }}>Sign Out</button>
            </div>

            
            
            <div style={{ width: '100%', height: 250, margin: '20px 0', backgroundColor: '#F9FAFB' }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#4F46E5" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="text" placeholder="Item Name" value={form.description} style={{ padding: '10px' }} onChange={e => setForm({...form, description: e.target.value})} required />
                <input type="number" placeholder="Value" value={form.amount} style={{ padding: '10px' }} onChange={e => setForm({...form, amount: e.target.value})} required />
                <select value={form.type} style={{ padding: '10px' }} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                </select>
                <input type="text" placeholder="Category" value={form.category} style={{ padding: '10px' }} onChange={e => setForm({...form, category: e.target.value})} required />
                <input type="date" value={form.date} style={{ padding: '10px' }} onChange={e => setForm({...form, date: e.target.value})} required />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#10B981', color: 'white', border: 'none' }}>Log</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="10">
                <thead>
                    <tr style={{ backgroundColor: '#eee' }}>
                        <th>Description</th><th>Amount</th><th>Type</th><th>Category</th><th>Date</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx.id}>
                            <td>{tx.description}</td>
                            <td style={{ color: tx.type === 'EXPENSE' ? 'red' : 'green' }}>${tx.amount}</td>
                            <td>{tx.type}</td><td>{tx.category}</td><td>{tx.date}</td>
                            <td>
                                <button onClick={() => { setEditingId(tx.id); setForm(tx); }}>Edit</button>
                                <button onClick={() => handleDelete(tx.id)} style={{ marginLeft: '5px' }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;