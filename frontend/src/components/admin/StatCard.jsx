import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, change, trend = 'up' }) {
  return (
    <div className="bg-surface-50 dark:bg-dark-card rounded-lg border border-surface-300 dark:border-primary-900/40 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-ink-600 dark:text-secondary-300">{label}</p>
          <p className="text-3xl font-bold text-ink-800 dark:text-secondary-100 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm font-medium mt-2 ${
                trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend === 'up' ? '↑' : '↓'} {change} من الشهر الماضي
            </p>
          )}
        </div>
        <div className="p-3 bg-secondary-200 dark:bg-primary-900 rounded-lg">
          <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  );
}


