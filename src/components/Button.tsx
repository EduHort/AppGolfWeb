// src/components/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
    const baseClasses = "w-full flex justify-center py-3 px-4 border cursor-pointer rounded-lg shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = variant === 'primary'
        ? "border-transparent text-white bg-purple-600 hover:bg-purple-700"
        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50";

    return <button className={`${baseClasses} ${variantClasses} ${className}`} {...props} />;
}