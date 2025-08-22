"use client";

import Image from "next/image";
import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emailSettings, setEmailSettings] = useState({
    emailDelay: '1',
    fromName: 'Your Store Name',
    fromEmail: 'hello@yourstore.com',
    emailSubject: 'You left something behind! Complete your order',
    emailMessage: `Hi {customer_name},

We noticed you left some items in your cart. Don't worry, we've saved them for you!

Your cart contains:
{cart_items}

Complete your purchase now and get these items before they're gone.

Thanks,
{store_name}`
  });
  const [stats, setStats] = useState({
    revenue: 2847,
    cartsRecovered: 127,
    recoveryRate: 18.3,
    avgCartValue: 22.41
  });

  const showTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const saveSettings = () => {
    // Simulate API call
    alert('Settings saved successfully!');
    console.log('Settings saved:', emailSettings);
  };

  const refreshCarts = () => {
    // Simulate refreshing carts
    alert('Carts refreshed! Found 2 new abandoned carts.');
  };

  const startTrial = () => {
    // Simulate starting trial
    alert('Redirecting to Shopify App Store for installation...');
    // In real implementation, this would redirect to the Shopify App Store
  };

  const updateStats = () => {
    setStats(prevStats => ({
      ...prevStats,
      revenue: prevStats.revenue + Math.floor(Math.random() * 10),
      avgCartValue: parseFloat((prevStats.avgCartValue + Math.random()).toFixed(2))
    }));
  };

  const showRecoveryNotification = () => {
    const notifications = [
      'Cart recovered! $89.99 sale completed by sarah.johnson@email.com',
      'New abandoned cart detected: $156.50 from mike.chen@email.com',
      'Email sent successfully to jessica.white@email.com',
      'Cart recovery rate increased to 18.5%!'
    ];
    
    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
    
    // In a real implementation, you would use a proper notification system
    alert(`CartCash: ${randomNotification}`);
  };

  useEffect(() => {
    const statsInterval = setInterval(updateStats, 30000);
    const notificationInterval = setInterval(showRecoveryNotification, 45000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(notificationInterval);
    };
  }, []);

  return (
    <div className="container">
    <div className="header">
        <h1>💰 CartCash</h1>
        <p>Recover abandoned carts automatically for Shopify Basic plans</p>
    </div>
    
    <div className="dashboard">
        <div className="nav-tabs">
            <button 
                className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => showTab('dashboard')}
            >
                Dashboard
            </button>
            <button 
                className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} 
                onClick={() => showTab('settings')}
            >
                Settings
            </button>
            <button 
                className={`nav-tab ${activeTab === 'carts' ? 'active' : ''}`} 
                onClick={() => showTab('carts')}
            >
                Abandoned Carts
            </button>
            <button 
                className={`nav-tab ${activeTab === 'pricing' ? 'active' : ''}`} 
                onClick={() => showTab('pricing')}
            >
                Upgrade
            </button>
        </div>
        
        {/* Dashboard Tab */}
        <div id="dashboard" className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">${stats.revenue.toLocaleString()}</div>
                    <div className="stat-label">Revenue Recovered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.cartsRecovered}</div>
                    <div className="stat-label">Carts Recovered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.recoveryRate}%</div>
                    <div className="stat-label">Recovery Rate</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${stats.avgCartValue.toFixed(2)}</div>
                    <div className="stat-label">Avg. Cart Value</div>
                </div>
            </div>
            
            <div className="alert alert-success">
                <strong>Great news!</strong> Your cart recovery rate is above the industry average of 15%. Keep it up!
            </div>
            
            <h3 style={{ marginBottom: "20px" }}>Recent Activity</h3>
            <div className="abandoned-cart-list">
                <div className="cart-item">
                    <div className="cart-header">
                        <span className="cart-email">sarah.johnson@email.com</span>
                        <span className="cart-value">$89.99</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cart-time">2 hours ago</span>
                        <span className="status-badge status-sent">Email Sent</span>
                    </div>
                </div>
                <div className="cart-item">
                    <div className="cart-header">
                        <span className="cart-email">mike.chen@email.com</span>
                        <span className="cart-value">$156.50</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cart-time">4 hours ago</span>
                        <span className="status-badge status-pending">Pending</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Settings Tab */}
        <div id="settings" className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
            <h3 style={{ marginBottom: "30px" }}>Email Settings</h3>
            
            <div className="form-group">
                <label className="form-label">Delay Before Sending Email</label>
                <select 
                    className="form-select" 
                    value={emailSettings.emailDelay}
                    onChange={(e) => setEmailSettings({...emailSettings, emailDelay: e.target.value})}
                >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="24">24 hours</option>
                </select>
            </div>
            
            <div className="form-group">
                <label className="form-label">From Name</label>
                <input 
                    type="text" 
                    className="form-input" 
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">From Email</label>
                <input 
                    type="email" 
                    className="form-input" 
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">Email Subject</label>
                <input 
                    type="text" 
                    className="form-input" 
                    value={emailSettings.emailSubject}
                    onChange={(e) => setEmailSettings({...emailSettings, emailSubject: e.target.value})}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">Email Message</label>
                <textarea 
                    className="form-textarea"
                    value={emailSettings.emailMessage}
                    onChange={(e) => setEmailSettings({...emailSettings, emailMessage: e.target.value})}
                />
            </div>
            
            <button className="btn btn-primary" onClick={saveSettings}>Save Settings</button>
        </div>
        
        {/* Abandoned Carts Tab */}
        <div id="carts" className={`tab-content ${activeTab === 'carts' ? 'active' : ''}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h3>Abandoned Carts (23)</h3>
                <button className="btn btn-secondary" onClick={refreshCarts}>Refresh</button>
            </div>
            
            <div className="abandoned-cart-list">
                <div className="cart-item">
                    <div className="cart-header">
                        <span className="cart-email">emily.davis@email.com</span>
                        <span className="cart-value">$234.99</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cart-time">30 minutes ago</span>
                        <span className="status-badge status-pending">Pending Email</span>
                    </div>
                    <div style={{ marginTop: "10px", color: "#6c757d" }}>
                        Items: Wireless Headphones, Phone Case
                    </div>
                </div>
                
                <div className="cart-item">
                    <div className="cart-header">
                        <span className="cart-email">alex.rodriguez@email.com</span>
                        <span className="cart-value">$67.50</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cart-time">1 hour ago</span>
                        <span className="status-badge status-sent">Email Sent</span>
                    </div>
                    <div style={{ marginTop: "10px", color: "#6c757d" }}>
                        Items: T-Shirt (2x), Stickers
                    </div>
                </div>
                
                <div className="cart-item">
                    <div className="cart-header">
                        <span className="cart-email">jessica.white@email.com</span>
                        <span className="cart-value">$189.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="cart-time">3 hours ago</span>
                        <span className="status-badge status-sent">Email Sent</span>
                    </div>
                    <div style={{ marginTop: "10px", color: "#6c757d" }}>
                        Items: Sneakers, Socks (3x)
                    </div>
                </div>
            </div>
        </div>
        
        {/* Pricing Tab */}
        <div id="pricing" className={`tab-content ${activeTab === 'pricing' ? 'active' : ''}`}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <h2>Simple, Profitable Pricing</h2>
                <p style={{ fontSize: "1.1em", color: "#6c757d" }}>One recovered sale pays for the entire year</p>
            </div>
            
            <div className="pricing-card">
                <h3>CartCash Pro</h3>
                <div className="price">$4.99<span style={{ fontSize: "0.4em", color: "#6c757d" }}>/month</span></div>
                <div className="price-subtitle">Everything you need to recover abandoned carts</div>
                
                <ul className="feature-list">
                    <li>Automatic email sending</li>
                    <li>Customizable email templates</li>
                    <li>Real-time analytics dashboard</li>
                    <li>Cart recovery tracking</li>
                    <li>Revenue reporting</li>
                    <li>Email delivery optimization</li>
                    <li>24/7 customer support</li>
                </ul>
                
                <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", padding: "15px" }} 
                    onClick={() => startTrial()}
                >
                    Start 7-Day Free Trial
                </button>
                
                <div style={{ marginTop: "20px", color: "#6c757d", fontSize: "0.9em" }}>
                    No setup fees • Cancel anytime • Average ROI: 2,400%
                </div>
            </div>
            
            <div className="alert alert-warning" style={{ marginTop: "30px" }}>
                <strong>Limited Time:</strong> Start your free trial today and recover your first abandoned cart within 24 hours!
            </div>
        </div>
    </div>
</div>
  );
}
