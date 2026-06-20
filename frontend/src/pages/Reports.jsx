import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [clientReport, setClientReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [activeTab, setActiveTab] = useState('client');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/clients').then(({ data }) => setClients(data)).catch(() => {});
    api.get('/reports/revenue').then(({ data }) => setRevenueReport(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setLoading(true);
      api.get(`/reports/client/${selectedClient}`)
        .then(({ data }) => setClientReport(data))
        .catch(() => toast.error('Failed to load report'))
        .finally(() => setLoading(false));
    }
  }, [selectedClient]);

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const report = clientReport;
    if (!report) return;
    printWindow.document.write(`
      <html><head><title>Client Report - ${report.client.fullName}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#1e293b}
      h1{color:#4f46e5;margin-bottom:4px}h2{color:#334155;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:14px}
      th{background:#f8fafc;font-weight:600}.stat{display:inline-block;padding:12px 24px;
      background:#f8fafc;border-radius:8px;margin:4px;text-align:center}
      .stat-value{font-size:24px;font-weight:700;color:#4f46e5}
      .stat-label{font-size:12px;color:#64748b}</style></head><body>
      <h1>Client Progress Report</h1><p style="color:#64748b">${report.client.fullName} &bull; Generated ${new Date().toLocaleDateString()}</p>
      <div style="margin:20px 0">
      <div class="stat"><div class="stat-value">${report.summary.progressEntries}</div><div class="stat-label">Progress Entries</div></div>
      <div class="stat"><div class="stat-value">${report.summary.startWeight || '—'} kg</div><div class="stat-label">Start Weight</div></div>
      <div class="stat"><div class="stat-value">${report.summary.currentWeight || '—'} kg</div><div class="stat-label">Current Weight</div></div>
      <div class="stat"><div class="stat-value">${report.summary.weightChange} kg</div><div class="stat-label">Weight Change</div></div>
      <div class="stat"><div class="stat-value">$${report.summary.totalPayments}</div><div class="stat-label">Total Paid</div></div>
      </div>
      <h2>Client Details</h2>
      <table><tr><th>Field</th><th>Value</th></tr>
      <tr><td>Email</td><td>${report.client.email}</td></tr>
      <tr><td>Phone</td><td>${report.client.phone || '—'}</td></tr>
      <tr><td>Age</td><td>${report.client.age || '—'}</td></tr>
      <tr><td>Fitness Goal</td><td>${report.client.fitnessGoal || '—'}</td></tr>
      <tr><td>Plan</td><td>${report.client.subscriptionPlan}</td></tr>
      <tr><td>Status</td><td>${report.client.status}</td></tr></table>
      ${report.progress.length > 0 ? `<h2>Progress History</h2><table><tr><th>Date</th><th>Weight</th><th>BMI</th><th>Body Fat</th><th>Notes</th></tr>
      ${report.progress.map(p => `<tr><td>${new Date(p.date).toLocaleDateString()}</td><td>${p.weight || '—'}</td><td>${p.bmi || '—'}</td><td>${p.bodyFat ? p.bodyFat+'%' : '—'}</td><td>${p.notes || '—'}</td></tr>`).join('')}
      </table>` : ''}
      ${report.payments.length > 0 ? `<h2>Payment History</h2><table><tr><th>Date</th><th>Amount</th><th>Plan</th><th>Status</th></tr>
      ${report.payments.map(p => `<tr><td>${new Date(p.createdAt).toLocaleDateString()}</td><td>$${p.amount}</td><td>${p.plan}</td><td>${p.status}</td></tr>`).join('')}
      </table>` : ''}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const revenueChartData = revenueReport ? Object.entries(revenueReport.monthlyData).map(([month, data]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: data.revenue,
    transactions: data.count,
  })).slice(-12) : [];

  const planChartData = revenueReport ? Object.entries(revenueReport.planBreakdown).map(([plan, amount]) => ({
    name: plan, value: amount,
  })) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-dark-400 text-sm mt-1">Generate and export detailed reports</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'client', icon: UserIcon, label: 'Client Reports' },
          { key: 'revenue', icon: CurrencyDollarIcon, label: 'Revenue Reports' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'client' && (
        <div className="space-y-6">
          <div className="glass-card p-4">
            <label className="input-label">Select Client</label>
            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="input-field">
              <option value="">Choose a client...</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
            </select>
          </div>

          {loading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}

          {clientReport && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{clientReport.client.fullName}'s Report</h2>
                <button onClick={exportToPDF} className="btn-secondary inline-flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-4 h-4" /> Export PDF
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: 'Entries', value: clientReport.summary.progressEntries },
                  { label: 'Start Weight', value: `${clientReport.summary.startWeight || '—'} kg` },
                  { label: 'Current Weight', value: `${clientReport.summary.currentWeight || '—'} kg` },
                  { label: 'Change', value: `${clientReport.summary.weightChange} kg` },
                  { label: 'Total Paid', value: `$${clientReport.summary.totalPayments}` },
                ].map(s => (
                  <div key={s.label} className="glass-card p-4 text-center">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-dark-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {clientReport.progress.length > 1 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Weight Progress</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={clientReport.progress.slice().reverse().map(p => ({
                      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      weight: p.weight, bmi: p.bmi,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                      <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {activeTab === 'revenue' && revenueReport && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold gradient-text">${revenueReport.totalRevenue?.toLocaleString()}</p>
              <p className="text-sm text-dark-400 mt-1">Total Revenue</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-white">{revenueReport.totalTransactions}</p>
              <p className="text-sm text-dark-400 mt-1">Total Transactions</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-3xl font-bold text-accent-400">
                ${revenueReport.totalTransactions ? Math.round(revenueReport.totalRevenue / revenueReport.totalTransactions) : 0}
              </p>
              <p className="text-sm text-dark-400 mt-1">Avg. Transaction</p>
            </div>
          </div>

          {revenueChartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue by Plan</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={planChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                      {planChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {planChartData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs text-dark-300">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {item.name}: ${item.value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
