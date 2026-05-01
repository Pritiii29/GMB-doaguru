import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/api';
import { CreditCard, Check, ArrowRight, Building2, Mail, Phone, AlertCircle } from 'lucide-react';

const SubscriptionRedirect = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [clientDetails, setClientDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSubscriptionPageData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [client, plans] = await Promise.all([
          subscriptionService.getActiveClientForSubscription(clientId),
          subscriptionService.getSubscriptionPlans()
        ]);

        setClientDetails(client);
        setSubscriptionPlans(plans);
        if (plans.length > 0) {
          setSelectedPlan(plans[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch subscription page data:', error);
        setErrorMessage(error.message || 'Active client not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionPageData();
  }, [clientId]);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const selectedPlanDetails = subscriptionPlans.find(p => p.id === selectedPlan);

  const handleContinue = () => {
    const businessName = clientDetails?.businessName || clientDetails?.name || 'Client';
    const planName = selectedPlanDetails?.name || 'selected plan';
    alert(`${planName} selected for ${businessName}. Please contact admin to register your subscription. Client ID: ${clientId}`);
    navigate('/');
  };

  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `Rs. ${amount.toLocaleString('en-IN')}`;
  };

  const getPlanFeatures = (features) => {
    if (!features) return [];
    if (Array.isArray(features)) return features;

    try {
      return JSON.parse(features);
    } catch (error) {
      console.error('Failed to parse plan features:', error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Client Not Available</h1>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard size={32} className="text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Choose Your Plan</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Subscribe to unlock the full power of QR-Based Review System
          </p>
        </div>

        {clientDetails && (
          <div className="max-w-3xl mx-auto mb-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                {clientDetails.logo ? (
                  <img
                    src={`http://${window.location.hostname}:5000${clientDetails.logo}`}
                    alt={clientDetails.businessName || clientDetails.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 size={28} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900 truncate">
                    {clientDetails.businessName || clientDetails.name}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    Active Client
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{clientDetails.email}</span>
                  </div>
                  {clientDetails.mobile && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone size={16} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{clientDetails.mobile}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-3">Client ID: {clientDetails.clientId}</p>
              </div>
            </div>

            {clientDetails.subscriptionId && (
              <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                This client already has an active {clientDetails.planName} subscription. Please login again to continue.
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {subscriptionPlans.map(plan => {
            const features = getPlanFeatures(plan.features);

            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                  selectedPlan === plan.id
                    ? 'border-primary bg-white shadow-xl scale-105'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                <div className={`p-8 text-center ${selectedPlan === plan.id ? 'bg-primary/10' : 'bg-slate-50'}`}>
                  {plan.badge && (
                    <div className="inline-block px-3 py-1 mb-4 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="text-4xl font-bold text-primary">{formatCurrency(plan.price)}</div>
                    <p className="text-sm text-slate-600 mt-1">per {plan.duration_days} days</p>
                  </div>

                  {selectedPlan === plan.id && (
                    <div className="inline-block px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold">
                      Selected
                    </div>
                  )}
                </div>

                <div className="px-8 py-6">
                  {plan.max_reviews_per_month && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">
                        Up to {plan.max_reviews_per_month} reviews/month
                      </p>
                    </div>
                  )}

                  {features.length > 0 && (
                    <div className="space-y-3">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedPlanDetails && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl border-2 border-primary/20 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {selectedPlanDetails.name} Plan Selected
              </h2>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-slate-600 text-sm mb-2">Plan Price</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(selectedPlanDetails.price)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-sm mb-2">Duration</p>
                    <p className="text-3xl font-bold text-slate-900">{selectedPlanDetails.duration_days} Days</p>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Note:</strong> Your account admin needs to register this subscription.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-slate-200 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Can I change my plan later?</h4>
              <p className="text-slate-600">Yes, you can upgrade or downgrade your plan anytime through your dashboard.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Is there a free trial?</h4>
              <p className="text-slate-600">Yes, our Starter plan is completely free with all basic features included.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What happens when my subscription expires?</h4>
              <p className="text-slate-600">Your data is preserved. You can renew anytime, or contact support for assistance.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
              <p className="text-slate-600">We offer a 7-day money-back guarantee if you're not satisfied with your plan.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRedirect;
