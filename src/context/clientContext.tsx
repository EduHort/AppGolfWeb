// src/context/clientContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { Cliente } from '@/types/types';
import { getClientByPhone, saveClientData, updateClientData } from '@/services/firestore';
import { validateClient } from '@/util/validateSurvey';

export const initialClientState: Cliente = { nome: "", fone: "", email: null, clube: "", cidade: "", estado: "" };

// A interface do contexto permanece a mesma
interface ClientContextType {
    client: Cliente | null;
    buttonMode: "cadastrar" | "iniciar";
    modalVisible: boolean;
    loading: boolean;
    handleFoneBlur: (foneInput: string) => Promise<Cliente | 'not-found' | 'error'>;
    handleSaveOrUpdateClient: (formData: Cliente) => Promise<Cliente | null>;
    openClientModal: () => void;
    closeClientModal: () => void;
    resetClientContextState: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClient = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClient deve ser usado dentro de um ClientProvider');
    }
    return context;
};

interface ClientProviderProps {
    children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
    const [client, setClient] = useState<Cliente | null>(null);
    const [buttonMode, setButtonMode] = useState<"cadastrar" | "iniciar">("cadastrar");
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFoneBlur = async (foneInput: string): Promise<Cliente | 'not-found' | 'error'> => {
        const trimmedFone = foneInput.trim();
        if (trimmedFone.length < 10) {
            toast.warning("O número de Telefone está incompleto ou inválido.");
            setClient(null);
            setButtonMode("cadastrar");
            return 'error';
        }

        setLoading(true);
        // MUDANÇA: Em vez de Keyboard.dismiss(), tiramos o foco do elemento ativo.
        (document.activeElement as HTMLElement)?.blur();
        try {
            const foundClient = await getClientByPhone(trimmedFone);
            if (foundClient) {
                toast.success(`Cliente encontrado: ${foundClient.nome}`);
                setClient(foundClient);
                setButtonMode("iniciar");
                return foundClient;
            } else {
                toast.info("Telefone não cadastrado. Preencha os dados para continuar.");
                setButtonMode("cadastrar");
                setClient(null);
                return 'not-found';
            }
        } catch (error: any) {
            console.error("Erro ao buscar cliente:", error);
            toast.error(error.message || "Não foi possível buscar os dados do cliente.");
            setButtonMode("cadastrar");
            setClient(null);
            return 'error';
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOrUpdateClient = async (formData: Cliente): Promise<Cliente | null> => {
        const validation = validateClient(formData);
        if (!validation.isValid) {
            const errorMessage = "Por favor, preencha os campos obrigatórios: " + validation.missingFields.join(", ");
            toast.error(errorMessage);
            return null;
        }

        setLoading(true);
        try {
            let savedOrUpdatedClient: Cliente & { id: string };

            if (client?.id) { // Atualizando cliente
                if (formData.fone !== client.fone) {
                    const existing = await getClientByPhone(formData.fone);
                    if (existing) {
                        toast.error("Este número de telefone já está cadastrado para outro cliente.");
                        return null;
                    }
                }
                const result = await updateClientData({ ...formData, id: client.id });
                if (!result.success) {
                    toast.error(result.message || "Não foi possível atualizar o cliente.");
                    return null;
                }
                savedOrUpdatedClient = { ...formData, id: client.id };
            } else { // Cadastrando um novo cliente
                const existing = await getClientByPhone(formData.fone);
                if (existing) {
                    toast.error("Este número de telefone já está cadastrado.");
                    return null;
                }
                const result = await saveClientData(formData);
                if (!result.success || !result.id) {
                    toast.error(result.message || "Não foi possível salvar o cliente.");
                    return null;
                }
                savedOrUpdatedClient = { ...formData, id: result.id };
            }

            setClient(savedOrUpdatedClient);
            setButtonMode("iniciar");
            setModalVisible(false);
            toast.success("Dados do cliente salvos!");
            return savedOrUpdatedClient;
        } catch (error: any) {
            console.error("Erro ao salvar/atualizar cliente:", error);
            toast.error(error.message || "Ocorreu um problema ao salvar os dados.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const openClientModal = () => setModalVisible(true);
    const closeClientModal = () => setModalVisible(false);

    const resetClientContextState = () => {
        setClient(null);
        setButtonMode("cadastrar");
        setModalVisible(false);
        setLoading(false);
    };

    return (
        <ClientContext.Provider value={{
            client, buttonMode, modalVisible, loading,
            handleFoneBlur, handleSaveOrUpdateClient, openClientModal, closeClientModal, resetClientContextState,
        }}>
            {children}
        </ClientContext.Provider>
    );
};