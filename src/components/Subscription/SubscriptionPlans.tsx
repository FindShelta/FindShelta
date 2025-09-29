import React, { useState } from 'react';
import { Check, CreditCard, Clock } from 'lucide-react';
import Header from '../Layout/Header';

const SubscriptionPlans: React.FC = () => {
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Agent Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Subscribe now and start listing when approved
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Monthly
              </h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ₦15,000
              </div>
              <p className="text-gray-500 dark:text-gray-400">per month</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Unlimited listings</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Analytics</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Priority support</span>
              </li>
            </ul>
            
            <button
              onClick={() => setShowPaymentInfo(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
          </div>

          {/* Quarterly Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Quarterly
              </h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ₦40,000
              </div>
              <p className="text-gray-500 dark:text-gray-400">3 months</p>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Save ₦5,000</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Unlimited listings</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Analytics</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Priority support</span>
              </li>
            </ul>
            
            <button
              onClick={() => setShowPaymentInfo(true)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
          </div>

          {/* Annual Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Annual
              </h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                ₦150,000
              </div>
              <p className="text-gray-500 dark:text-gray-400">12 months</p>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Save ₦30,000</p>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Unlimited listings</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Analytics</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">Priority support</span>
              </li>
            </ul>
            
            <button
              onClick={() => setShowPaymentInfo(true)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Payment Information Modal */}
        {showPaymentInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Payment Instructions
                </h3>
              </div>

              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Transfer payment to:
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Bank:</strong> Opay</div>
                  <div><strong>Account:</strong> 9080151095</div>
                  <div><strong>Name:</strong> Benneth Agantiem</div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      After payment, email your receipt to <strong>support@findshelta.com</strong> to activate your subscription.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentInfo(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('9080151095');
                    alert('Account number copied!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Copy Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;