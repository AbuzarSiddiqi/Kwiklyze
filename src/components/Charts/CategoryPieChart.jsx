import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  Work: '#3B82F6',
  Study: '#10B981',
  Exercise: '#EF4444',
  Meal: '#F59E0B',
  Leisure: '#8B5CF6',
  Sleep: '#6366F1'
};

const CategoryPieChart = ({ activities }) => {
  // Calculate time per category
  const categoryData = {};
  
  activities.forEach(activity => {
    if (activity.duration) {
      categoryData[activity.category] = (categoryData[activity.category] || 0) + activity.duration;
    }
  });

  const data = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    hours: (value / 60).toFixed(1)
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-4xl mb-2">📊</p>
          <p>No time data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, hours }) => `${name}: ${hours}h`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8B5CF6'} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${(value / 60).toFixed(1)} hours`} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryPieChart;
