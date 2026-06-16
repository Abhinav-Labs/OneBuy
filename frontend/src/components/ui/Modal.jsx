import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div
            
            
            
            
            className="relative w-full max-w-2xl bg-premium-light rounded-xl shadow-2xl overflow-hidden z-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && <h2 className="text-2xl font-bold text-premium-dark">{title}</h2>}
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-premium-dark transition-colors rounded-full hover:bg-gray-100">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
