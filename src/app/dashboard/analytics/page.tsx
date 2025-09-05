'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { ChartBarIcon, SparklesIcon, ArrowTrendingUpIcon, UsersIcon, ClockIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms analyze your cart abandonment patterns to predict recovery opportunities and suggest optimal timing for follow-ups.',
      status: 'Coming Soon'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'Performance Analytics',
      description: 'Track conversion rates, revenue recovery, and ROI metrics with detailed charts and trend analysis across all your campaigns.',
      status: 'Coming Soon'
    },
    {
      icon: UsersIcon,
      title: 'Customer Behavior Analysis',
      description: 'Understand your customers better with detailed segmentation, cart abandonment reasons, and personalized recovery strategies.',
      status: 'Coming Soon'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Monitoring',
      description: 'Monitor abandoned carts as they happen with instant notifications and live dashboard updates for immediate action.',
      status: 'Coming Soon'
    },
    {
      icon: CursorArrowRaysIcon,
      title: 'Smart Recommendations',
      description: 'AI-driven suggestions for discount amounts, email timing, and personalized messaging based on historical data and customer behavior.',
      status: 'Coming Soon'
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Reporting',
      description: 'Comprehensive reports with exportable data, custom date ranges, and detailed breakdowns by product, category, and customer segment.',
      status: 'Coming Soon'
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ChartBarIcon className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
              <SparklesIcon className="h-8 w-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Powerful analytics powered by AI to maximize your abandoned cart recovery success.
            Transform data into actionable insights that drive revenue growth.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            🚧 Currently Under Development
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <IconComponent className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                    {feature.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-900/20 to-purple-50 dark:to-purple-900/20 rounded-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What to Expect
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our AI-powered analytics will provide you with unprecedented insights into your
              abandoned cart recovery performance, helping you optimize every aspect of your strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Smart Cart Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI analyzes each abandoned cart to determine the best recovery strategy,
                    considering factors like cart value, customer history, and abandonment reason.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Predictive Timing
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Machine learning predicts the optimal time to send recovery emails
                    based on customer behavior patterns and historical conversion data.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Automated Optimization
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Continuously learn and adapt your recovery strategies based on
                    real-time performance data and A/B testing results.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Revenue Forecasting
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Predict future revenue recovery based on current trends and
                    historical performance with confidence intervals.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">5</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Customer Segmentation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Automatically segment customers by behavior, value, and recovery
                    likelihood to target the right audience with the right message.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">6</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ROI Tracking
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track the exact return on investment for every campaign and
                    automatically optimize spending based on performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want to be notified when analytics launches?
          </p>
          <button className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Get Early Access
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
