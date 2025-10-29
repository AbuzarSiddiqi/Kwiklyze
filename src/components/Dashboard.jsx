import { formatDate, formatDuration } from '../utils/timeUtils';
import CategoryPieChart from './Charts/CategoryPieChart';
import DailyChart from './Charts/DailyChart';

const Dashboard = ({ activities, tasks, routine }) => {
  const todayActivities = activities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  const totalTimeToday = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const completedToday = tasks.filter(t => t.completed && new Date(t.createdAt).toDateString() === new Date().toDateString()).length;
  const pendingTasks = tasks.filter(t => !t.completed).length;

  // Calculate category breakdown
  const categoryBreakdown = {};
  todayActivities.forEach(activity => {
    if (activity.duration) {
      categoryBreakdown[activity.category] = (categoryBreakdown[activity.category] || 0) + activity.duration;
    }
  });

  // Compare with routine
  const routineHours = routine.length;
  const loggedHours = Object.keys(categoryBreakdown).length;
  const adherencePercent = routineHours > 0 ? Math.round((loggedHours / routineHours) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="opacity-90">{formatDate()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-3xl mb-2">⏱️</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(totalTimeToday)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Time Tracked Today</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedToday}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {pendingTasks}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {adherencePercent}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Routine Adherence</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Today's Activity Breakdown</h3>
          <DailyChart activities={todayActivities} />
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Time Distribution</h3>
          <CategoryPieChart activities={todayActivities} />
        </div>
      </div>

      {/* Category Details */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Category Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(categoryBreakdown).map(([category, minutes]) => {
              const percentage = totalTimeToday > 0 ? Math.round((minutes / totalTimeToday) * 100) : 0;
              
              return (
                <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-xl mb-1">
                    {category === 'Work' && '💼'}
                    {category === 'Study' && '📚'}
                    {category === 'Exercise' && '🏃'}
                    {category === 'Meal' && '🍽️'}
                    {category === 'Leisure' && '🎮'}
                    {category === 'Sleep' && '😴'}
                  </div>
                  <div className="font-bold dark:text-white">{category}</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatDuration(minutes)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{percentage}% of day</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 dark:text-white">Recent Activity</h3>
        {todayActivities.slice(-5).reverse().map(activity => (
          <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mb-2">
            <div className="text-2xl">
              {activity.category === 'Work' && '💼'}
              {activity.category === 'Study' && '📚'}
              {activity.category === 'Exercise' && '🏃'}
              {activity.category === 'Meal' && '🍽️'}
              {activity.category === 'Leisure' && '🎮'}
              {activity.category === 'Sleep' && '😴'}
            </div>
            <div className="flex-1">
              <p className="font-medium dark:text-white">{activity.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(activity.timestamp).toLocaleTimeString()}
                {activity.duration && ` • ${formatDuration(activity.duration)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
