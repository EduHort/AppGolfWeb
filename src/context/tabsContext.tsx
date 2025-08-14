import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TabsData, Carrinho } from "../types/types";
import { useCarts } from './cartsContext';

// Interface para o que o contexto vai fornecer
type TabsContextType = {
    tabsData: TabsData;
    initializeTabsData: (cart: Carrinho) => void;
    setComentario: (value: string | null) => void;
    setVoltageAtIndex: (index: number, value: string) => void;
    setDensidadeAtIndex: (index: number, value: string) => void;
    setVerificarBateriaField: (field: keyof TabsData['verificarBateria'], value: string) => void;
    resetTabsData: () => void;
};

// Estado inicial padrão
const defaultTabsData: TabsData = {
    tensao: [],
    comentario: null,
    densidade: [],
    verificarBateria: {
        caixa: "OK",
        parafusos: "OK",
        terminais: "OK",
        polos: "OK",
        nivel: "OK"
    },
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const TabsProvider = ({ children }: { children: ReactNode }) => {
    const [tabsData, setTabsData] = useState<TabsData>(defaultTabsData);
    const { selectedCart } = useCarts();

    // Efeito para inicializar/resetar os dados quando um carrinho é selecionado
    useEffect(() => {
        if (selectedCart) {
            initializeTabsData(selectedCart);
        } else {
            // Se nenhum carrinho está selecionado, volta ao estado padrão
            resetTabsData();
        }
    }, [selectedCart]);

    // Função para inicializar os dados com base na quantidade de baterias do carrinho
    const initializeTabsData = (cart: Carrinho) => {
        const quantity = parseInt(cart.quantidade, 10) || 0;
        const newTabsData = {
            ...defaultTabsData,
            tensao: Array(quantity).fill(""),
            densidade: Array(quantity).fill(""),
        };
        setTabsData(newTabsData);
    };

    const resetTabsData = async () => {
        setTabsData(defaultTabsData);
    };

    // --- FUNÇÕES ESPECIALIZADAS PARA ATUALIZAR O ESTADO ---

    const setComentario = (value: string | null) => {
        setTabsData(prevTabsData => ({
            ...prevTabsData,
            comentario: value
        }));
    };

    // A função que você precisava, agora funcionando corretamente
    const setVoltageAtIndex = (index: number, value: string) => {
        // Sanitiza o valor para garantir que é um número com ponto decimal
        const sanitizedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
        const parts = sanitizedValue.split(".");
        const newValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;

        // Cria uma cópia do array de tensões para não mutar o estado diretamente
        const updatedVoltages = [...tabsData.tensao];
        updatedVoltages[index] = newValue;

        // Atualiza o estado principal com o array modificado
        const newTabsData = { ...tabsData, tensao: updatedVoltages };
        setTabsData(newTabsData);
    };

    const setDensidadeAtIndex = (index: number, value: string) => {
        const sanitizedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
        const parts = sanitizedValue.split(".");
        const newValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;

        const updatedDensidades = [...(tabsData.densidade ?? [])];
        updatedDensidades[index] = newValue;

        const newTabsData = { ...tabsData, densidade: updatedDensidades };
        setTabsData(newTabsData);
    };

    const setVerificarBateriaField = (field: keyof TabsData['verificarBateria'], value: string) => {
        // Cria uma cópia do objeto aninhado
        const updatedVerificarBateria = { ...tabsData.verificarBateria, [field]: value };

        // Atualiza o estado principal com o objeto aninhado modificado
        const newTabsData = { ...tabsData, verificarBateria: updatedVerificarBateria };
        setTabsData(newTabsData);
    };

    return (
        <TabsContext.Provider
            value={{
                tabsData,
                initializeTabsData,
                setComentario,
                setVoltageAtIndex,
                setDensidadeAtIndex,
                setVerificarBateriaField,
                resetTabsData,
            }}
        >
            {children}
        </TabsContext.Provider>
    );
};

export const useTabs = () => {
    const context = useContext(TabsContext);
    if (context === undefined) {
        throw new Error("useTabs deve ser usado dentro de um TabsProvider");
    }
    return context;
};