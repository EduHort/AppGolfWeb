// src/app/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/types/types";
import { LocalStorageKeys, saveData, getData } from "@/services/storage";
import EstadoPicker from "@/components/EstadoPicker";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<Usuario>({
    nome: "",
    cidade: "",
    estado: "PR",
    clube: "",
  });

  // Carrega os dados do usuário do localStorage quando o componente monta
  useEffect(() => {
    const data = getData<Usuario>(LocalStorageKeys.USER_DATA);
    if (data) {
      setUserData(data);
    }
  }, []);

  // Salva os dados no estado e no localStorage a cada mudança
  const saveUserData = (newData: Usuario) => {
    setUserData(newData);
    saveData(LocalStorageKeys.USER_DATA, newData);
  };

  const validateFields = () => {
    const { nome, cidade, estado, clube } = userData;
    // Garante que nenhum campo esteja vazio (trim() remove espaços em branco)
    return nome.trim() && cidade.trim() && estado.trim() && clube.trim();
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página ao submeter o formulário
    if (!validateFields()) {
      alert("Erro: Todos os campos são obrigatórios.");
      return;
    }
    router.push("/clientes");
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextFieldRef?.current ? nextFieldRef.current.focus() : (e.target as HTMLInputElement).blur();
    }
  };

  const nomeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const clubeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const cidadeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  return (
    <main
      style={{ backgroundImage: "url('/Banner01-login.png')" }}
      className="flex min-h-screen items-center justify-center bg-gray-100 p-4 bg-no-repeat bg-cover bg-center"
    >
      {/* O "Card" branco. Pegamos o estilo do nosso <Layout> e o trouxemos para cá,
          já que esta página não usa o Layout padrão. */}
      <div className="w-full max-w-md rounded-xl bg-white p-6 sm:p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Início da Pesquisa
        </h1>

        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block mb-1.5 text-sm font-medium text-gray-700">
              Nome do Usuário *
            </label>
            <Input
              id="nome"
              type="text"
              value={userData.nome}
              onChange={(e) => saveUserData({ ...userData, nome: e.target.value })}
              required
              ref={nomeRef}
              onKeyDown={(e) => handleKeyDown(e, clubeRef)}
            />
          </div>

          <div>
            <label htmlFor="clube" className="block mb-1.5 text-sm font-medium text-gray-700">
              Clube *
            </label>
            <Input
              id="clube"
              type="text"
              value={userData.clube}
              onChange={(e) => saveUserData({ ...userData, clube: e.target.value })}
              required
              ref={clubeRef}
              onKeyDown={(e) => handleKeyDown(e, cidadeRef)}
            />
          </div>

          <div>
            <label htmlFor="cidade" className="block mb-1.5 text-sm font-medium text-gray-700">
              Cidade *
            </label>
            <Input
              id="cidade"
              type="text"
              value={userData.cidade}
              onChange={(e) => saveUserData({ ...userData, cidade: e.target.value })}
              required
              ref={cidadeRef}
              onKeyDown={(e) => handleKeyDown(e)}
            />
          </div>

          <EstadoPicker
            value={userData.estado}
            onChange={(estado) => saveUserData({ ...userData, estado })}
          />

          <div className="pt-2">
            <Button type="submit" disabled={!validateFields()}>
              Iniciar Pesquisa
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}