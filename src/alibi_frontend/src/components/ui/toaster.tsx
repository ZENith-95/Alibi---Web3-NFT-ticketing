"use client"

import React from 'react';
import { useToast } from './use-toast';
import type { ToasterToast } from './use-toast';

// Basic Toast component
const Toast: React.FC<ToasterToast> = ({ id, title, description, action }) => {
  return (
    <div className="toast-container">
      {title && <div className="toast-title">{title}</div>}
      {description && <div className="toast-description">{description}</div>}
      {action && <div className="toast-action">{action}</div>}
    </div>
  );
};

// Toaster component that displays all toasts
export const Toaster: React.FC = () => {
  // We're getting an empty array for toasts, so let's handle that case
  const { toasts = [], dismiss } = useToast();

  return (
    <div className="toaster">
      {(toasts as ToasterToast[]).map((toast) => (
        <div key={toast.id} onClick={() => dismiss(toast.id)}>
          <Toast
            id={toast.id}
            title={toast.title}
            description={toast.description}
            action={toast.action}
            variant={toast.variant}
            duration={toast.duration}
          />
        </div>
      ))}
    </div>
  );
};
