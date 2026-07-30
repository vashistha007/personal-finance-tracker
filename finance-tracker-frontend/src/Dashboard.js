import React, { useEffect, useState } from 'react';
import API from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
    const [transactions, setTransactions] = useState([]);
    const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', category: '', date: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchTransactions(); }, []);

    const fetchTransactions = async () => {
        try {
            const res = await API.get('/transactions');
            setTransactions(res.data);
        } catch (error) {
            console.error("Problem facing  to fetch data:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/transactions/${editingId}`, form);
                setEditingId(null);
            } else {
                await API.post('/transactions', form);
            }
            setForm({ description: '', amount: '', type: 'EXPENSE', category: '', date: '' });
            fetchTransactions();
        } catch (error) {
            console.error("Problem faced while submtting the Form :", error);
        }
    };

    const exportToCSV = () => {
        if (transactions.length === 0) {
            alert("No data found to export!");
            return;
        }

        const headers = ["Description,Amount,Type,Category,Date\n"];
        const rows = transactions.map(tx => 
            `"${tx.description.replace(/"/g, '""')}",${tx.amount},"${tx.type}","${tx.category}","${tx.date}"`
        );
        const csvContent = headers.concat(rows.join("\n")).join("");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Report_${new Date().toISOString().slice(0, 7)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id) => {
        if (window.confirm("confirm to delete")) {
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
        <>
            {/* --- CSS STYLES START --- */}
            <style>{`
                /* Font import for modern look */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                body {
                    background-color: #f3f4f6; /* Light gray background */
                    margin: 0;
                    font-family: 'Inter', sans-serif;
                }

                .dashboard-container {
                    padding: 40px 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                /* Header Styling */
                .header-panel {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 30px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #e5e7eb;
                }

                .main-title {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .header-btns {
                    display: flex;
                    gap: 10px;
                }

                /* General Button Styles */
                .btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn:active { transform: scale(0.98); }

                .btn-export {
                    background-color: #4f46e5; /* Indigo */
                    color: white;
                }
                .btn-export:hover { background-color: #4338ca; }

                .btn-logout {
                    background-color: white;
                    color: #4b5563;
                    border: 1px solid #d1d5db;
                }
                .btn-logout:hover { background-color: #f9fafb; color: #ef4444; border-color: #fca5a5; }

                .btn-submit {
                    background-color: #10b981; /* Emerald */
                    color: white;
                    height: 46px; /* Match input height */
                }
                .btn-submit:hover { background-color: #059669; }

                /* Card Styling (for Chart & Form) */
                .card {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    margin-bottom: 25px;
                }

                .card-title {
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #374151;
                }

                /* Form Styling */
                .transaction-form {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 15px;
                    align-items: end;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-input {
                    padding: 12px 15px;
                    border-radius: 8px;
                    border: 1px solid #d1d5db;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                    transition: border-color 0.2s;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #a5b4fc;
                    box-shadow: 0 0 0 3px rgba(165, 180, 252, 0.3);
                }

                /* Table Styling */
                .table-container {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    overflow: hidden; /* For border radius to work */
                }

                .transaction-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .transaction-table thead {
                    background-color: #f9fafb;
                }

                .transaction-table th {
                    text-align: left;
                    padding: 15px 20px;
                    font-weight: 600;
                    color: #4b5563;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 12px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .transaction-table tbody tr {
                    border-bottom: 1px solid #f3f4f6;
                    transition: background-color 0.2s;
                }

                .transaction-table tbody tr:last-child { border-bottom: none; }
                .transaction-table tbody tr:hover { background-color: #f9fafb; }

                .transaction-table td {
                    padding: 18px 20px;
                    color: #1f2937;
                }

                /* Amount types styling */
                .amt-expense { color: #ef4444 !important; font-weight: 600; }
                .amt-income { color: #10b981 !important; font-weight: 600; }

                .badge-type {
                    padding: 4px 8px;
                    border-radius: 99px;
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .badge-expense { background-color: #fee2e2; color: #991b1b; }
                .badge-income { background-color: #d1fae5; color: #065f46; }

                /* Action buttons in table */
                .action-btns {
                    display: flex;
                    gap: 8px;
                }

                .btn-table {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    border: 1px solid #d1d5db;
                    background: white;
                    font-weight: 500;
                }
                .btn-table-edit:hover { background-color: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
                .btn-table-del:hover { background-color: #fef2f2; color: #dc2626; border-color: #fecaca; }

            `}</style>
            {/* --- CSS STYLES END --- */}

            <div className="dashboard-container">
                {/* Header Section */}
                <div className="header-panel">
                    <h2 className="main-title">
                        <span>📊</span> Financial Ledger
                    </h2>
                    <div className="header-btns">
                        <button onClick={exportToCSV} className="btn btn-export">
                            📥 Export CSV
                        </button>
                        <button onClick={onLogout} className="btn btn-logout">
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="card">
                    <h3 className="card-title">Category wise Balance</h3>
                    <div style={{ width: '100%', height: 300, backgroundColor: 'white' }}>
                        <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
        <Tooltip 
            contentStyle={{border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
            cursor={{fill: 'rgba(79, 70, 229, 0.05)'}}
        />
        <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
    </BarChart>
</ResponsiveContainer>
                    </div>
                </div>

                {/* Form Section */}
                <div className="card">
                    <h3 className="card-title">{editingId ? "Edit Transaction" : "Add New Transaction"}</h3>
                    <form onSubmit={handleSubmit} className="transaction-form">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input type="text" placeholder="E.g., Groceries" value={form.description} className="form-input" onChange={e => setForm({...form, description: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Value (₹)</label>
                            <input type="number" placeholder="0.00" value={form.amount} className="form-input" onChange={e => setForm({...form, amount: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select value={form.type} className="form-input" onChange={e => setForm({...form, type: e.target.value})} >
                                <option value="EXPENSE">💸 Expense</option>
                                <option value="INCOME">💰 Income</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" placeholder="E.g., Food, Bill" value={form.category} className="form-input" onChange={e => setForm({...form, category: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" value={form.date} className="form-input" onChange={e => setForm({...form, date: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn btn-submit">
                            {editingId ? 'Update Log' : '➕ Add Log'}
                        </button>
                    </form>
                </div>

                {/* Table Section */}
                <div className="table-container">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{textAlign: 'center', color: '#9ca3af', padding: '40px'}}>Add Something</td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td style={{fontWeight: '500'}}>{tx.description}</td>
                                        <td className={tx.type === 'EXPENSE' ? 'amt-expense' : 'amt-income'}>
                                            {tx.type === 'EXPENSE' ? '-' : '+'}₹{parseFloat(tx.amount).toFixed(2)}
                                        </td>
                                        <td>
                                            <span className={`badge-type ${tx.type === 'EXPENSE' ? 'badge-expense' : 'badge-income'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td>{tx.category}</td>
                                        <td style={{color: '#6b7280'}}>{tx.date}</td>
                                        <td>
                                            <div className="action-btns" style={{justifyContent: 'center'}}>
                                                <button onClick={() => { setEditingId(tx.id); setForm(tx); window.scrollTo(0, 300); }} className="btn-table btn-table-edit">Edit</button>
                                                <button onClick={() => handleDelete(tx.id)} className="btn-table btn-table-del">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default Dashboard;