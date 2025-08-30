'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Coming Soon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            We're working on comprehensive analytics to help you track your abandoned cart recovery performance.
            This feature will be available soon!
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
