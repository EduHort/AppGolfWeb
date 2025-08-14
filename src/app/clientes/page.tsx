// src/app/clientes/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { useClient, initialClientState } from "@/context/clientContext";
import { Cliente, Usuario } from "@/types/types";

import Layout from "@/components/Layout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import EstadoPicker from "@/components/EstadoPicker";
import { getData, LocalStorageKeys } from "@/services/storage";
import { ArrowLeft, X as CloseIcon } from 'lucide-react';

export default function ClientesPage() {
    const {
        client, buttonMode, modalVisible, loading,
        handleFoneBlur, handleSaveOrUpdateClient, openClientModal, closeClientModal, resetClientContextState
    } = useClient();

    const router = useRouter();
    const [foneInput, setFoneInput] = useState("");
    const [formClient, setFormClient] = useState<Cliente>(initialClientState);
    const [foneConfirmed, setFoneConfirmed] = useState(false);

    // Efeito para popular/resetar o formulário do modal quando ele abre
    useEffect(() => {
        if (modalVisible) {
            // Se o 'client' do contexto existe (cliente encontrado), usamos ele para preencher o form.
            if (client) {
                setFormClient(client);
            } else {
                // Se não há cliente no contexto, estamos cadastrando.
                // O form é preenchido com o fone digitado e dados do usuário.
                const prefillFormForNewClient = async () => {
                    let userData: Usuario | null = null;
                    try {
                        userData = getData<Usuario>(LocalStorageKeys.USER_DATA);
                    } catch (e) { console.warn("Erro ao buscar dados do usuário"); }

                    setFormClient({
                        ...initialClientState,
                        fone: foneInput, // Usa o fone que está no input da tela
                        clube: userData?.clube ?? "",
                        cidade: userData?.cidade ?? "",
                        estado: userData?.estado ?? "",
                    });
                }
                prefillFormForNewClient();
            }
        }
    }, [modalVisible, client, foneInput]);

    const onFoneInputBlur = async () => {
        if (loading) return;
        const result = await handleFoneBlur(foneInput);
        if (result !== 'error') setFoneConfirmed(true);
        else setFoneConfirmed(false);
    };

    const updateFormField = <K extends keyof Cliente>(field: K, value: Cliente[K]) => {
        setFormClient(prev => ({ ...prev, [field]: value }));
    };

    const onSaveClient = async () => { await handleSaveOrUpdateClient(formClient); };

    const handleNavigate = () => {
        if (client?.id) router.push("/carrinhos");
        else alert("Atenção: Selecione um cliente para continuar.");
    };

    const nomeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
    const emailRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
    const clubeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
    const cidadeRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

    const handleKeyDown = (e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nextFieldRef?.current ? nextFieldRef.current.focus() : (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <Layout>
            <div className="relative flex items-center justify-center mb-6 h-14">
                <button onClick={() => router.back()} className="absolute left-0 p-2 text-gray-500 rounded-full hover:bg-gray-100 cursor-pointer">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Cliente</h1>
            </div>

            <Input
                type="tel" placeholder="Telefone *" value={foneInput}
                onChange={(e) => setFoneInput(e.target.value)}
                onBlur={onFoneInputBlur} maxLength={11} disabled={loading}
                onKeyDown={(e) => handleKeyDown(e)}
            />

            {foneConfirmed && (
                <div className="mt-4">
                    {buttonMode === "iniciar" ? (
                        <div className="flex items-center gap-4">
                            <Button onClick={openClientModal} disabled={loading} variant="secondary">Alterar</Button>
                            <Button onClick={handleNavigate} disabled={loading || !client?.id} variant="primary">Continuar</Button>
                        </div>
                    ) : (
                        <Button onClick={openClientModal} disabled={loading} variant="primary">Cadastrar</Button>
                    )}
                </div>
            )}

            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="relative w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {client?.id ? "Alterar Cliente" : "Cadastrar Cliente"}
                            </h2>
                            <button onClick={closeClientModal} className="p-1 text-gray-400 rounded-full hover:bg-gray-100">
                                <CloseIcon size={24} />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); onSaveClient(); }}>
                            <div className="mt-6 space-y-4">

                                <div>
                                    <label htmlFor="fone" className="block mb-1.5 text-sm font-medium text-gray-700">
                                        Telefone *
                                    </label>
                                    <Input
                                        id="fone"
                                        type="tel"
                                        value={formClient.fone}
                                        onChange={(e) => updateFormField('fone', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, nomeRef)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="nome" className="block mb-1.5 text-sm font-medium text-gray-700">
                                        Nome *
                                    </label>
                                    <Input
                                        ref={nomeRef}
                                        id="nome"
                                        type="text"
                                        value={formClient.nome}
                                        onChange={(e) => updateFormField('nome', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, emailRef)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-gray-700">
                                        E-mail
                                    </label>
                                    <Input
                                        ref={emailRef}
                                        id="email"
                                        type="email"
                                        value={formClient.email ?? ""}
                                        onChange={(e) => updateFormField('email', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, clubeRef)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="clube" className="block mb-1.5 text-sm font-medium text-gray-700">
                                        Clube *
                                    </label>
                                    <Input
                                        ref={clubeRef}
                                        id="clube"
                                        type="text"
                                        value={formClient.clube}
                                        onChange={(e) => updateFormField('clube', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, cidadeRef)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cidade" className="block mb-1.5 text-sm font-medium text-gray-700">
                                        Cidade *
                                    </label>
                                    <Input
                                        ref={cidadeRef}
                                        id="cidade"
                                        type="text"
                                        value={formClient.cidade}
                                        onChange={(e) => updateFormField('cidade', e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e)}
                                    />
                                </div>

                                <EstadoPicker
                                    value={formClient.estado}
                                    onChange={(estado) => updateFormField('estado', estado)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 mt-6 sm:flex-row sm:justify-end">
                                <Button type="button" onClick={closeClientModal} disabled={loading} variant="secondary">Cancelar</Button>
                                <Button type="submit" disabled={loading} variant="primary">
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}