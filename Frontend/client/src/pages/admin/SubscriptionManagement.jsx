import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionService, adminService } from '../../services/api';
import { Check, Plus, CreditCard, Users, TrendingUp } from 'lucide-react';

const SubscriptionManagement = () => {
  const validTabs = ['plans', 'clients', 'all-subscriptions', 'stats'];
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('subscriptionActiveTab');
    return validTabs.includes(savedTab) ? savedTab : 'plans';
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    planId: '',
    auto_renew: true,
    amount_paid: 0,
    payment_method: 'manual',
    transaction_id: '',
    notes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (activeTab === 'plans') {
        const data = await subscriptionService.getSubscriptionPlans();
        setSubscriptionPlans(data);
      } else if (activeTab === 'clients') {
        const clientsData = await adminService.getClients();
        setClients(clientsData.filter(client => Number(client.isActive) === 1));
        const plansData = await subscriptionService.getSubscriptionPlans();
        setSubscriptionPlans(plansData);
      } else if (activeTab === 'all-subscriptions') {
        const data = await subscriptionService.getAllSubscriptions();
        setAllSubscriptions(data);
      } else if (activeTab === 'stats') {
        const data = await subscriptionService.getSubscriptionStats();
        setSubscriptionStats(data);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('subscriptionActiveTab', activeTab);
    fetchData();
  }, [activeTab, fetchData]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleRegisterSubscription = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await subscriptionService.registerSubscription(
        formData.clientId,
        parseInt(formData.planId),
        {
          autoRenew: formData.auto_renew,
          amountPaid: parseFloat(formData.amount_paid),
          paymentMethod: formData.payment_method,
          transactionId: formData.transaction_id,
          notes: formData.notes
        }
      );

      setSuccessMessage('Subscription registered successfully!');
      setFormData({
        clientId: '',
        planId: '',
        auto_renew: true,
        amount_paid: 0,
        payment_method: 'manual',
        transaction_id: '',
        notes: ''
      });
      setShowRegisterForm(false);
      setTimeout(() => {
        fetchData();
      }, 1500);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to register subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        await subscriptionService.cancelSubscription(subscriptionId);
        setSuccessMessage('Subscription cancelled successfully!');
        setTimeout(() => {
          fetchData();
        }, 1000);
      } catch {
        setErrorMessage('Failed to cancel subscription');
      }
    }
  };

  const handleRenewSubscription = async (subscriptionId) => {
    try {
      await subscriptionService.renewSubscription(subscriptionId);
      setSuccessMessage('Subscription renewed successfully!');
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch {
      setErrorMessage('Failed to renew subscription');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`;
  };

  const getPlanFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;

    try {
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscription Management</h1>
        <p className="text-slate-500 font-medium tracking-tight mt-2">Manage client subscriptions and plans</p>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'plans', label: 'Plans', icon: CreditCard },
          { id: 'clients', label: 'Register Subscription', icon: Plus },
          { id: 'all-subscriptions', label: 'All Subscriptions', icon: Users },
          { id: 'stats', label: 'Statistics', icon: TrendingUp }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center min-h-[240px]">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subscriptionPlans.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 font-medium">
              No subscription plans found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(plan.price)}
                </div>
                <p className="text-sm text-slate-600 mt-1">per {plan.duration_days} days</p>
              </div>

              {plan.max_reviews_per_month && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900">
                    Up to {plan.max_reviews_per_month} reviews/month
                  </p>
                </div>
              )}

              {getPlanFeatures(plan.features).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Features:</p>
                  {getPlanFeatures(plan.features).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
          )}
        </div>
      )}

      {/* Register Subscription Tab */}
      {activeTab === 'clients' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Register Client Subscription</h2>
            <button
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              New Subscription
            </button>
          </div>

          {showRegisterForm && (
            <form onSubmit={handleRegisterSubscription} className="bg-white rounded-xl border border-slate-200 p-8 mb-8 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Client</label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Choose a client --</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.clientId}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Plan</label>
                  <select
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">-- Choose a plan --</option>
                    {subscriptionPlans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount Paid</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="manual">Manual</option>
                    <option value="online">Online</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.auto_renew}
                      onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">Auto Renew</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add any notes about this subscription..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Register Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="bg-slate-200 text-slate-900 px-6 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Active Clients List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Active Clients Without Subscription</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Client Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-slate-500">No clients found</td>
                    </tr>
                  ) : (
                    clients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{client.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{client.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{client.businessName || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            client.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* All Subscriptions Tab */}
      {activeTab === 'all-subscriptions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">All Subscriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Client Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Plan</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Start Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">End Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">No subscriptions found</td>
                  </tr>
                ) : (
                  allSubscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{sub.clientName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{sub.planName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(sub.start_date)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(sub.end_date)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(sub.amount_paid)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          {sub.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleRenewSubscription(sub.id)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-semibold text-xs hover:bg-emerald-100 transition-colors"
                              >
                                Renew
                              </button>
                              <button
                                onClick={() => handleCancelSubscription(sub.id)}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded font-semibold text-xs hover:bg-red-100 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-600">
              Expired means the plan end date is over. Cancelled means admin manually stopped the subscription.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[240px]">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : subscriptionStats.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 font-medium">
              No subscription statistics found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptionStats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">{stat.planName || 'Overall'}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Active Subscriptions:</span>
                      <span className="text-2xl font-bold text-primary">{stat.activeSubscriptions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Expired:</span>
                      <span className="text-2xl font-bold text-yellow-600">{stat.expiredSubscriptions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Cancelled:</span>
                      <span className="text-2xl font-bold text-red-600">{stat.cancelledSubscriptions || 0}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Active Revenue:</span>
                        <span className="text-2xl font-bold text-emerald-600">{formatCurrency(stat.totalActiveRevenue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;

