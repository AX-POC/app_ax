import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export const triggerConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // since particles fall down, start a bit higher than random
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
  }, 250);
};

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
      padding: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    iconTheme: {
      primary: '#4ade80',
      secondary: '#fff',
    },
  });
};

export const showCenterSuccessToast = (message: string) => {
  toast.success(message, {
    position: 'top-center',
    duration: 5000,
    style: {
      borderRadius: '12px',
      background: 'rgba(20, 20, 20, 0.95)',
      color: '#fff',
      padding: '20px 24px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    },
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    style: {
      borderRadius: '10px',
      background: '#333',
      color: '#fff',
      padding: '16px'
    }
  });
};
