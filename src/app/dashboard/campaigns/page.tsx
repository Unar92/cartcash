'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">📢</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Recovery Campaigns Coming Soon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Automated recovery campaigns are in development. You'll be able to create and manage
            email sequences to recover abandoned carts more effectively.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
