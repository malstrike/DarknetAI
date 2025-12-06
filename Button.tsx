import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'matrix';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-sm font-mono tracking-wider transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-bg shadow-[0_0_15px_var(--color-primary)]",
    danger: "bg-danger/10 text-danger border border-danger hover:bg-danger hover:text-white shadow-[0_0_10px_rgba(255,42,109,0.2)]",
    ghost: "bg-transparent text-slate-400 hover:text-text hover:bg-white/5 border border-surface",
    matrix: "bg-green-900/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
      {isLoading ? (
        <span className="animate-pulse">PROCESSING...</span>
      ) : children}
    </button>
  );
};
