import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformance = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({ loadTime: 0, renderTime: 0 });

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure render time
    const measureRender = () => {
      const renderTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      setMetrics({
        loadTime: startTime,
        renderTime,
        memoryUsage
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} Performance:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
        });
      }
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);
  }, [componentName]);

  return metrics;
};

export default usePerformance;