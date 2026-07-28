import React, { useEffect, useState } from 'react';
import API from './api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', type: 'EXPENSE', category: '', date: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { 
    fetchTransactions(); 
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
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
    const rows = transactions.map(tx => 
      `"${(tx.description || '').replace(/"/g, '""')}",${tx.amount},"${tx.type}","${tx.category}","${tx.date}"`
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
    const amt = parseFloat(curr.amount) || 0;
    if (found) {
      found.amount += curr.type === 'EXPENSE' ? amt : -amt;
    } else {
      acc.push({ category: curr.category, amount: curr.type === 'EXPENSE' ? amt : -amt });
    }
    return acc;
  }, []);

  return (
    <div className="dashboard-container">
      {/* Dynamic CSS styles for responsiveness */}
      <style>{`
        .dashboard-container {
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* Header */
        .header-section {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        @media (min-width: 576px) {
          .header-actions {
            width: auto;
          }
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background-color 0.2s;
          flex: 1;
        }

        @media (min-width: 576px) {
          .btn { flex: initial; }
        }

        .btn-export { background-color: #4F46E5; color: white; }
        .btn-export:hover { background-color: #4338CA; }
        .btn-logout { background-color: #EF4444; color: white; }
        .btn-logout:hover { background-color: #DC2626; }

        /* Chart */
        .chart-wrapper {
          width: 100%;
          height: 280px;
          margin: 20px 0;
          background-color: #F9FAFB;
          border-radius: 8px;
          padding: 10px 0;
          box-sizing: border-box;
        }

        /* Responsive Form */
        .transaction-form {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 24px;
          background: #F3F4F6;
          padding: 16px;
          border-radius: 8px;
        }

        @media (min-width: 600px) {
          .transaction-form {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 900px) {
          .transaction-form {
            grid-template-columns: 2fr 1fr 1fr 1.5fr 1.5fr auto;
          }
        }

        .form-input, .form-select {
          padding: 10px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 14px;
          width: 100%;
          box-sizing: border-box;
        }

        .btn-submit {
          background-color: #10B981;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-submit:hover { background-color: #059669; }

        /* Responsive Table */
        .table-responsive {
          width: 100%;
          overflow-x: auto;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-radius: 8px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          min-width: 600px; /* Forces scroll bar on small screens if needed */
        }

        .data-table th, .data-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #E5E7EB;
        }

        .data-table th {
          background-color: #F3F4F6;
          color: #374151;
          font-weight: 600;
        }

        .btn-edit {
          background-color: #3B82F6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 6px;
        }

        .btn-delete {
          background-color: #EF4444;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>

      {/* Header Section */}
      <div className="header-section">
        <h2 style={{ margin: 0 }}>📊 Financial Ledger</h2>
        <div className="header-actions">
          <button className="btn btn-export" onClick={exportToCSV}>📥 Export Report</button>
          <button className="btn btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="transaction-form">
        <input 
          type="text" 
          placeholder="Item Name" 
          className="form-input" 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          required 
        />
        <input 
          type="number" 
          placeholder="Value" 
          className="form-input" 
          value={form.amount} 
          onChange={e => setForm({...form, amount: e.target.value})} 
          required 
        />
        <select 
          className="form-select" 
          value={form.type} 
          onChange={e => setForm({...form, type: e.target.value})}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input 
          type="text" 
          placeholder="Category" 
          className="form-input" 
          value={form.category} 
          onChange={e => setForm({...form, category: e.target.value})} 
          required 
        />
        <input 
          type="date" 
          className="form-input" 
          value={form.date} 
          onChange={e => setForm({...form, date: e.target.value})} 
          required 
        />
        <button type="submit" className="btn-submit">
          {editingId ? 'Update' : 'Log'}
        </button>
      </form>

      {/* Table Section */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.description}</td>
                <td style={{ color: tx.type === 'EXPENSE' ? '#DC2626' : '#16A34A', fontWeight: 'bold' }}>
                  ${tx.amount}
                </td>
                <td>{tx.type}</td>
                <td>{tx.category}</td>
                <td>{tx.date}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingId(tx.id); setForm(tx); }}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(tx.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;