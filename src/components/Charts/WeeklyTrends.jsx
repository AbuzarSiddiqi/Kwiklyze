import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  Work: '#3B82F6',
  Study: '#10B981',
  Exercise: '#EF4444',
  Meal: '#F59E0B',
  Leisure: '#8B5CF6',
  Sleep: '#6366F1'
};

const WeeklyTrends = ({ activities }) => {
  // Group activities by day and category
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const weekData = last7Days.map(date => {
    const dayActivities = activities.filter(a => {
      const activityDate = new Date(a.timestamp).toISOString().split('T')[0];
      return activityDate === date;
    });

    const categories = {};
    dayActivities.forEach(activity => {
      if (activity.duration) {
        categories[activity.category] = (categories[activity.category] || 0) + activity.duration / 60;
      }
    });

    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      ...categories
    };
  });

  const allCategories = [...new Set(activities.map(a => a.category))];

  if (weekData.every(day => !Object.keys(day).some(key => key !== 'date'))) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-2">📉</p>
          <p>No weekly data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={weekData}>
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value.toFixed(1)}h`} />
        <Legend />
        {allCategories.map(category => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={COLORS[category] || '#8B5CF6'}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeeklyTrends;
