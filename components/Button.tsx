import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, fullWidth = false, variant = 'primary', className = '', ...props }) => {
    
    const baseClasses = "inline-flex items-center justify-center px-5 py-2.5 border text-sm font-bold font-display rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 active:scale-[0.98] active:shadow-inner";
    
    const variantClasses = {
        primary: 'text-white bg-gradient-to-br from-brand-primary to-brand-primary-dark hover:from-brand-primary-dark hover:to-brand-primary focus:ring-brand-primary shadow-lg hover:shadow-xl border-transparent',
        secondary: 'text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 focus:ring-brand-primary dark:text-white dark:bg-gray-700 dark:hover:bg-gray-600 border-transparent',
        danger: 'text-white bg-brand-accent-warning hover:bg-red-700 focus:ring-brand-accent-warning border-transparent',
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            {...props}
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;