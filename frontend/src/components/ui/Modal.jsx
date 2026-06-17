import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, noPadding = false }) => {
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            
            
            
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in"
          />
          
          <div
            
            
            
            
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-up">
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-premium-dark">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-premium-dark transition-colors rounded-full hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>
            )}
            
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 p-2 text-gray-500 hover:text-premium-dark transition-colors bg-white/80 backdrop-blur-sm rounded-full hover:bg-white shadow-sm">
                <X size={24} />
              </button>
            )}
            
            <div className={noPadding ? '' : 'p-6'}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
