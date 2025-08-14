import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import { Cliente, Carrinho, TabsData, Usuario, SurveyData } from "../types/types";

// --- VALORES INICIAIS PARA UM NOVO QUESTIONÁRIO ---
// Estes valores serão usados sempre que o contexto for inicializado ou resetado.

const initialUser: Usuario = { nome: "", cidade: "", estado: "", clube: "" };

const initialClient: Cliente = {
    nome: "",
    fone: "",
    email: null,
    clube: "",
    cidade: "",
    estado: "",
};

const initialCart: Carrinho = {
    marca: "",
    modelo: null,
    numero: null,
    cor: null,
    marcaBat: "",
    tipo: "Chumbo-ácido Flooded",
    tensao: "6V",
    quantidade: "2",
    dono: "",
};

const initialTabsData: TabsData = {
    verificarBateria: { caixa: "OK", parafusos: "OK", terminais: "OK", polos: "OK", nivel: "OK" },
    comentario: null,
    tensao: [],
    densidade: [],
};

// Objeto de estado inicial completo, baseado no tipo SurveyData
const initialSurveyData: SurveyData = {
    usuario: initialUser,
    cliente: initialClient,
    carrinho: initialCart,
    ...initialTabsData,
};

// --- TIPAGEM DO CONTEXTO ---

type OfflineSurveyContextType = {
    surveyData: SurveyData;
    updateSurveyPart: <K extends keyof SurveyData>(part: K, data: Partial<SurveyData[K]>) => void;
    updateTensaoArray: (index: number, value: string) => void;
    updateDensidadeArray: (index: number, value: string) => void;
    resetSurvey: () => void;
};

// --- CRIAÇÃO DO CONTEXTO ---

const OfflineSurveyContext = createContext<OfflineSurveyContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---

export const OfflineSurveyProvider = ({ children }: { children: ReactNode }) => {
    const [surveyData, setSurveyData] = useState<SurveyData>(initialSurveyData);

    // Efeito para ajustar o tamanho do array de 'tensao' e 'densidade' com base na 'quantidade' de baterias
    // Esta lógica de negócio é mantida.
    useEffect(() => {
        const numBaterias = parseInt(surveyData.carrinho.quantidade, 10) || 0;

        // Se ambos os arrays já têm o tamanho certo, não faz nada
        if (surveyData.tensao.length === numBaterias && surveyData.densidade && surveyData.densidade.length === numBaterias) {
            return;
        }

        // Cria os novos arrays com o tamanho correto, preservando valores existentes
        const newTensaoArray = Array(numBaterias)
            .fill("")
            .map((_, i) => surveyData.tensao[i] || "");

        const newDensidadeArray = Array(numBaterias)
            .fill("")
            .map((_, i) => (surveyData.densidade?.[i] || ""));

        // Atualiza o estado com ambos os arrays sincronizados
        setSurveyData(prevData => ({
            ...prevData,
            tensao: newTensaoArray,
            densidade: newDensidadeArray,
        }));
    }, [surveyData.carrinho.quantidade, surveyData.tensao, surveyData.densidade]);


    // --- FUNÇÕES HELPER ---

    /**
   * Atualiza uma parte do estado do questionário de forma inteligente.
   *
   * - `K extends keyof SurveyData`: Garante que a 'key' seja uma chave válida de SurveyData (ex: 'cliente', 'carrinho').
   * - `updates: Partial<SurveyData[K]>`: Garante que o objeto de 'updates' contenha apenas campos válidos
   *   para aquela parte específica do estado (ex: se a chave é 'cliente', os 'updates' só podem ser { nome: '...', fone: '...' }).
   */
    const updateSurveyPart = useCallback(
        <K extends keyof SurveyData>(key: K, updates: Partial<SurveyData[K]>) => {
            setSurveyData(prevData => {
                // Pega a parte do estado que queremos atualizar (ex: o objeto 'cliente' inteiro)
                const currentPartState = prevData[key];

                // Verificamos se essa parte é um objeto que podemos "mesclar"
                // (ou seja, um objeto, mas não um array ou nulo).
                const isMergableObject =
                    typeof currentPartState === "object" &&
                    currentPartState !== null &&
                    !Array.isArray(currentPartState);

                // --- LÓGICA PRINCIPAL ---

                if (isMergableObject) {
                    // CASO 1: É um objeto (como 'cliente' ou 'carrinho').
                    // Nós mesclamos o estado atual com as novas atualizações.
                    // O operador spread `...` garante que os campos não alterados sejam mantidos.
                    const updatedPart = { ...currentPartState, ...updates };

                    return {
                        ...prevData,
                        [key]: updatedPart,
                    };
                } else {
                    // CASO 2: É um valor primitivo (como 'comentario', que é uma string).
                    // Não há o que mesclar, então simplesmente substituímos o valor antigo pelo novo.
                    // Neste caso, o parâmetro 'updates' é o próprio novo valor.
                    return {
                        ...prevData,
                        [key]: updates,
                    };
                }
            });
        },
        []
    );

    /**
     * Atualiza um valor específico no array de tensões.
     */
    const updateTensaoArray = useCallback((index: number, value: string) => {
        setSurveyData(prevData => {
            const sanitizedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
            const parts = sanitizedValue.split(".");
            const newValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;
            const newTensao = [...prevData.tensao];
            newTensao[index] = newValue;
            return { ...prevData, tensao: newTensao };
        });
    }, []);

    const updateDensidadeArray = useCallback((index: number, value: string) => {
        setSurveyData(prevData => {
            const sanitizedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
            const parts = sanitizedValue.split(".");
            const newValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : sanitizedValue;
            const newDensidade = [...(prevData.densidade ?? [])];
            newDensidade[index] = newValue;
            return { ...prevData, densidade: newDensidade };
        });
    }, []);

    /**
     * Reseta todo o questionário para os valores iniciais.
     */
    const resetSurvey = useCallback(() => {
        setSurveyData(initialSurveyData);
    }, []);

    return (
        <OfflineSurveyContext.Provider
            value={{
                surveyData,
                updateSurveyPart,
                updateTensaoArray,
                updateDensidadeArray,
                resetSurvey,
            }}
        >
            {children}
        </OfflineSurveyContext.Provider>
    );
};

export const useOfflineSurvey = () => {
    const context = useContext(OfflineSurveyContext);
    if (context === undefined) {
        throw new Error("useOfflineSurvey deve ser usado dentro de um OfflineSurveyProvider");
    }
    return context;
};