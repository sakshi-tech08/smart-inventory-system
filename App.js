import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [data, setData] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', stock: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  const fetchData = () => {
    fetch('http://127.0.0.1:8000/inventory')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.log("Backend offline!"));
  };

  useEffect(() => { if(isLoggedIn) fetchData(); }, [isLoggedIn]);

  // --- Functions ---
  const handleLogin = () => {
    if(password === "admin123") setIsLoggedIn(true); // तुझा पासवर्ड 'admin123' आहे
    else alert("चुकीचा पासवर्ड!");
  };

  const handleAdd = () => {
    fetch('http://127.0.0.1:8000/add_item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).then(() => { fetchData(); setNewItem({ name: '', stock: 0 }); });
  };

  const handleSell = (name) => {
    fetch(`http://127.0.0.1:8000/sell_item/${name}`, { method: 'POST' }).then(() => fetchData());
  };

  const handleDelete = (name) => {
    fetch(`http://127.0.0.1:8000/delete_item/${name}`, { method: 'DELETE' }).then(() => fetchData());
  };

  // Search Filter
  const filteredData = data.filter(item => 
    item.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: filteredData.map(item => item.item),
    datasets: [{
      data: filteredData.map(item => item.stock),
      backgroundColor: ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6'],
    }]
  };

  // --- Login Screen ---
  if (!isLoggedIn) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', backgroundColor:'#2c3e50', color:'white', flexDirection:'column' }}>
        <h2>🔐 Admin Login</h2>
        <input type="password" placeholder="Enter Password" onChange={e => setPassword(e.target.value)} style={{ padding:'10px', borderRadius:'5px', marginBottom:'10px' }} />
        <button onClick={handleLogin} style={{ padding:'10px 20px', backgroundColor:'#2ecc71', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}>Login</button>
        <p style={{ marginTop:'10px', fontSize:'12px' }}>Hint: admin123</p>
      </div>
    );
  }

  // --- Main Dashboard ---
  const theme = {
    bg: isDarkMode ? '#1a1a1a' : '#f4f7f6',
    card: isDarkMode ? '#2d2d2d' : '#fff',
    text: isDarkMode ? '#fff' : '#2c3e50'
  };

  return (
    <div style={{ padding: '30px', textAlign: 'center', backgroundColor: theme.bg, color: theme.text, minHeight: '100vh', transition: '0.3s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1>🚀 Super Pro AI Inventory</h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding:'10px', borderRadius:'50%', cursor:'pointer' }}>{isDarkMode ? '☀️' : '🌙'}</button>
      </div>

      {/* Search & Add Form */}
      <div style={{ margin: '20px auto', padding: '20px', background: theme.card, width: '80%', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <input placeholder="🔍 Search Items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '10px', width:'250px', borderRadius: '5px', border: '1px solid #ddd', marginRight: '20px' }} />
        
        <input placeholder="New Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={{ padding: '10px', borderRadius: '5px', marginRight: '10px' }} />
        <input type="number" placeholder="Qty" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})} style={{ padding: '10px', borderRadius: '5px', width: '60px', marginRight:'10px' }} />
        <button onClick={handleAdd} style={{ padding: '10px 20px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Add</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        {/* Table */}
        <div style={{ width: '55%', background: theme.card, padding: '20px', borderRadius: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: theme.text }}>
            <thead><tr style={{ borderBottom:'2px solid #ddd' }}><th>Item</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredData.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td>{item.item}</td>
                  <td>{item.stock}</td>
                  <td>
                    <button onClick={() => handleSell(item.item)} style={{ background: '#f39c12', color: 'white', border: 'none', padding: '5px', borderRadius: '5px', marginRight: '5px' }}>Sell</button>
                    <button onClick={() => handleDelete(item.item)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px', borderRadius: '5px' }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Graph */}
        <div style={{ width: '35%', background: theme.card, padding: '20px', borderRadius: '15px' }}>
          <Pie data={chartData} />
        </div>
      </div>
    </div>
  );
}

export default App;