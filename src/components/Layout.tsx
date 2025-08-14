// src/components/Layout.tsx

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    // Fundo da página inteira: cinza claro, ocupa a altura mínima da tela,
    // e usa flexbox para centralizar o conteúdo.
    <main className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">

      {/* O "Card" que você pediu: um div branco com sombra e bordas arredondadas.
          Este será o contêiner principal para o conteúdo da sua página. */}
      <div className="w-full max-w-md rounded-xl bg-white p-6 sm:p-8 shadow-lg">
        {children}
      </div>

    </main>
  );
}