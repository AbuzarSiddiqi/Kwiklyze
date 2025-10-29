import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let showToastGlobal = null;

/**
 * Toast Notification System
 */
const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastGlobal = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    // Expose globally
    window.showToast = showToastGlobal;
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'ai': return '🤖';
      default: return 'ℹ️';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success': return 'from-green-500 to-green-600';
      case 'error': return 'from-red-500 to-red-600';
      case 'warning': return 'from-yellow-500 to-yellow-600';
      case 'info': return 'from-blue-500 to-blue-600';
      case 'ai': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`bg-gradient-to-r ${getColor(toast.type)} text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-auto`}
          >
            <span className="text-xl">{getIcon(toast.type)}</span>
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
export { showToastGlobal as showToast };
