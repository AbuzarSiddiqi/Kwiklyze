/**
 * Build comprehensive AI prompt from user data
 */
export const buildDailyPrompt = (activities, tasks, routine, personality = 'motivational') => {
  const currentTime = new Date().toLocaleString();
  
  // Format activities
  const activityLog = activities.map(activity => 
    `- ${activity.timestamp}: ${activity.description} (${activity.category}, ${activity.duration || 'ongoing'})`
  ).join('\n');
  
  // Format tasks
  const taskList = tasks.filter(t => !t.completed).map(task =>
    `- ${task.title} (Due: ${task.dueTime || 'No deadline'})`
  ).join('\n');
  
  const completedTasks = tasks.filter(t => t.completed).map(task =>
    `- ${task.title} ✓`
  ).join('\n');
  
  // Format routine
  const routineSchedule = routine.map(slot =>
    `${slot.time}: ${slot.activity} (${slot.category})`
  ).join('\n');
  
  // Personality traits
  const personalities = {
    motivational: 'You are energetic, encouraging, and always positive. Use motivational language and emojis.',
    calm: 'You are peaceful, zen-like, and speak in a soothing manner. Focus on mindfulness and balance.',
    funny: 'You are witty, humorous, and like to make jokes while still being helpful.',
    professional: 'You are formal, concise, and business-like. Provide direct, actionable advice.'
  };
  
  const personalityTrait = personalities[personality] || personalities.motivational;
  
  return `You are KwikLyze, an AI daily companion assistant. ${personalityTrait}

Current Time: ${currentTime}

USER'S DAILY ACTIVITY LOG:
${activityLog || 'No activities logged yet.'}

PENDING TASKS:
${taskList || 'No pending tasks.'}

COMPLETED TASKS:
${completedTasks || 'No completed tasks yet.'}

IDEAL DAILY ROUTINE:
${routineSchedule || 'No routine set.'}

Based on this information, provide helpful, personalized advice. Keep responses conversational, friendly, and under 100 words.`;
};

/**
 * Build end-of-day summary prompt
 */
export const buildSummaryPrompt = (activities, tasks, routine) => {
  const totalActivities = activities.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  
  // Calculate time spent per category
  const categoryTime = {};
  activities.forEach(activity => {
    if (activity.duration) {
      categoryTime[activity.category] = (categoryTime[activity.category] || 0) + activity.duration;
    }
  });
  
  const categoryBreakdown = Object.entries(categoryTime)
    .map(([cat, mins]) => `${cat}: ${mins} minutes`)
    .join(', ');
  
  return `You are KwikLyze. Generate a friendly end-of-day summary for the user.

STATISTICS:
- Total activities logged: ${totalActivities}
- Tasks completed: ${completedTasksCount}/${totalTasks}
- Time breakdown: ${categoryBreakdown || 'No time tracking data'}

Provide:
1. A brief congratulatory message
2. Key highlights from their day
3. Areas they did well in
4. One suggestion for tomorrow
5. A motivational closing

Keep it warm, personal, and under 150 words.`;
};

/**
 * Build quick advice prompt
 */
export const buildQuickAdvicePrompt = (currentActivity, recentActivities) => {
  return `User just logged: "${currentActivity}"
Recent activities: ${recentActivities.map(a => a.description).join(', ')}

Give quick, actionable advice (1-2 sentences) related to what they're doing now.`;
};
