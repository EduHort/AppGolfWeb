// src/components/Input.tsx

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

// Usamos 'forwardRef' para que possamos passar uma 'ref' para este componente,
// o que é essencial para focarmos no input programaticamente (nomeRef, emailRef, etc.).
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {

        const baseClasses = "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow disabled:bg-gray-100 disabled:cursor-not-allowed text-black";

        return (
            <input
                ref={ref}
                // Combinamos as classes base com quaisquer classes extras passadas via props.
                className={`${baseClasses} ${className}`}
                // Passamos todas as outras props (value, onChange, onKeyDown, etc.) para o input.
                {...props}
            />
        );
    }
);

// Define um nome de exibição para depuração no React DevTools.
Input.displayName = "Input";