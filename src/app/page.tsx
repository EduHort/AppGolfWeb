// src/app/page.tsx

"use client"; // Diretiva OBRIGATÓRIA para usar hooks como useState e useEffect

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/lib/types/types";
import { AsyncStorageKeys, saveData, getData } from "@/lib/services/storage";
import EstadoPicker from "@/components/EstadoPicker";

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<Usuario>({
    nome: "",
    cidade: "",
    estado: "PR",
    clube: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      const data = getData<Usuario>(AsyncStorageKeys.USER_DATA);
      if (data) {
        setUserData(data);
      }
    };
    loadUserData();
  }, []);

  const saveUserData = async (newData: Usuario) => {
    setUserData(newData);
    saveData(AsyncStorageKeys.USER_DATA, newData);
  };

  const validateFields = () => {
    const { nome, cidade, estado, clube } = userData;
    return nome && cidade && estado && clube;
  };

  const handleNext = () => {
    if (!validateFields()) {
      alert("Erro: Todos os campos são obrigatórios.");
      return;
    }
    router.push("/client");
  };

  return (
    // "ScreenLayout" web: um fundo cinza que centraliza o conteúdo
    <main style={{ backgroundImage: "url('/Banner01-login.png')" }}
      className="flex min-h-screen items-center justify-center bg-gray-100 p-4 bg-no-repeat bg-cover bg-center">

      {/* "Card" web: um div branco com sombra, padding e bordas arredondadas */}
      <div className="w-full max-w-md rounded-xl bg-green-100 p-8 shadow-lg">

        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Início da Pesquisa
        </h1>

        {/* Cada input é um <label> e um <input> dentro de um <div> */}
        <div className="mb-4">
          <label htmlFor="nome" className="block mb-1 font-medium text-gray-700">Nome do Usuário *</label>
          <input
            id="nome"
            type="text"
            value={userData.nome}
            onChange={(e) => saveUserData({ ...userData, nome: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="clube" className="block mb-1 font-medium text-gray-700">Clube *</label>
          <input
            id="clube"
            type="text"
            value={userData.clube}
            onChange={(e) => saveUserData({ ...userData, clube: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="cidade" className="block mb-1 font-medium text-gray-700">Cidade *</label>
          <input
            id="cidade"
            type="text"
            value={userData.cidade}
            onChange={(e) => saveUserData({ ...userData, cidade: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <EstadoPicker
          value={userData.estado}
          onChange={(estado) => saveUserData({ ...userData, estado })}
        />

        <button
          onClick={handleNext}
          className="w-full mt-4 rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Iniciar Pesquisa
        </button>
      </div>
    </main>
  );
}