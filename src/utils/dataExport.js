/**
 * Export all user data as JSON
 */
export const exportData = (activities, tasks, routine, settings) => {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    activities,
    tasks,
    routine,
    settings
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kwiklyze-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import data from JSON file
 */
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.activities || !data.tasks || !data.routine) {
          reject(new Error('Invalid data format'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Export activities as CSV
 */
export const exportActivitiesCSV = (activities) => {
  const headers = ['Date', 'Time', 'Activity', 'Category', 'Duration (min)'];
  const rows = activities.map(a => [
    new Date(a.timestamp).toLocaleDateString(),
    new Date(a.timestamp).toLocaleTimeString(),
    a.description,
    a.category,
    a.duration || 0
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `kwiklyze-activities-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
