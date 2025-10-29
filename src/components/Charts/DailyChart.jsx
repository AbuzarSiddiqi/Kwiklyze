import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { formatDuration } from '../../utils/timeUtils';

const COLORS = {
  Work: '#3B82F6',
  Study: '#10B981',
  Exercise: '#EF4444',
  Meal: '#F59E0B',
  Leisure: '#8B5CF6',
  Sleep: '#6366F1'
};

const DailyChart = ({ activities }) => {
  // Group by category and sum durations
  const categoryData = {};
  
  activities.forEach(activity => {
    if (activity.duration) {
      categoryData[activity.category] = (categoryData[activity.category] || 0) + activity.duration;
    }
  });

  const data = Object.entries(categoryData).map(([category, minutes]) => ({
    category,
    minutes,
    hours: (minutes / 60).toFixed(1)
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-2">📈</p>
          <p>No activity data for today</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="category" />
        <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
        <Tooltip 
          formatter={(value) => `${formatDuration(value)}`}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend />
        <Bar dataKey="minutes" name="Time Spent" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#8B5CF6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyChart;
