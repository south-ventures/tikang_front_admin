import React, { useEffect, useState } from 'react';

export default function WarningPopup({ message, onClose, type = 'error' }) {
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!show) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const progressColor = type === 'success' ? 'bg-white' : 'bg-white';

  return (
    <div className="fixed top-[60px] left-0 w-full z-[9999]">
      <div className={`${bgColor} text-white text-sm text-center font-semibold py-2 shadow-sm relative`}>
        {message}
        <div className={`absolute bottom-0 left-0 h-1 ${progressColor} animate-progress w-full`} />
      </div>
    </div>
  );
}
