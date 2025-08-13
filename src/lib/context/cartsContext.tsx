import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Carrinho } from '../types/types';
import { deleteCartData, getCartsData, saveCartData, updateCartData } from '../services/firestore';
import { useClient } from './clientContext';

export const initialCartFormState: (ownerId: string) => Carrinho = (ownerId) => ({
    marca: "", modelo: null, numero: null, cor: null, marcaBat: "",
    tipo: "Chumbo-ácido Flooded", tensao: "6V", quantidade: "2", dono: ownerId
});

interface CartsContextType {
    carts: Carrinho[];
    selectedCart: Carrinho | null;
    loadingCarts: boolean;
    fetchCarts: (clientId: string) => Promise<void>;
    addCart: (cartData: Omit<Carrinho, 'id'>) => Promise<boolean>;
    updateCart: (cartData: Carrinho) => Promise<boolean>;
    deleteCart: (cartId: string) => Promise<boolean>;
    resetCartsState: () => void;
    selectCartById: (cartId: string) => void;
    clearSelectedCart: () => void;
}

const CartsContext = createContext<CartsContextType | undefined>(undefined);

export const useCarts = () => {
    const context = useContext(CartsContext);
    if (!context) {
        throw new Error('useCarts deve ser usado dentro de um CartsProvider');
    }
    return context;
};

interface CartsProviderProps {
    children: ReactNode;
}

export const CartsProvider: React.FC<CartsProviderProps> = ({ children }) => {
    const [carts, setCarts] = useState<Carrinho[]>([]);
    const [selectedCart, setSelectedCart] = useState<Carrinho | null>(null);
    const [loadingCarts, setLoadingCarts] = useState(false);
    const { client } = useClient(); // Para reagir a mudanças no cliente

    const fetchCarts = useCallback(async (clientId: string) => {
        if (!clientId) {
            setCarts([]);
            return;
        }
        setLoadingCarts(true);
        try {
            const cartsData = await getCartsData(clientId);
            setCarts(cartsData || []);
        } catch (error: any) {
            console.error("Erro ao buscar carrinhos:", error);
            Alert.alert("Erro", "Não foi possível carregar os carrinhos.");
            setCarts([]);
        } finally {
            setLoadingCarts(false);
        }
    }, []);

    // Efeito para carregar carrinhos quando o cliente (com ID) muda
    useEffect(() => {
        if (client?.id) {
            fetchCarts(client.id);
        } else {
            setCarts([]); // Limpa carrinhos se não houver cliente logado/selecionado
        }
    }, [client, fetchCarts]);

    const selectCartById = (cartId: string) => {
        const cartToSelect = carts.find(cart => cart.id === cartId);
        if (cartToSelect) {
            setSelectedCart(cartToSelect);
        } else {
            console.warn(`selectCartById: Carrinho com ID ${cartId} não encontrado.`);
            setSelectedCart(null); // Garante que nenhum carrinho antigo permaneça selecionado
        }
    };

    const clearSelectedCart = () => {
        setSelectedCart(null);
    };

    const addCart = async (cartData: Omit<Carrinho, 'id'>): Promise<boolean> => {
        setLoadingCarts(true);
        try {
            const result = await saveCartData(cartData);
            if (!result.success || !result.id) {
                Alert.alert("Erro", result.message || "Não foi possível salvar o carrinho.");
                return false;
            }
            const newCartWithId: Carrinho = { ...cartData, id: result.id };
            setCarts(prevCarts => [...prevCarts, newCartWithId]);
            Alert.alert("Sucesso", "Carrinho salvo!");
            return true;
        } catch (error: any) {
            console.error("Erro ao adicionar carrinho:", error);
            Alert.alert("Erro", "Ocorreu um problema ao salvar o carrinho.");
            return false;
        } finally {
            setLoadingCarts(false);
        }
    };

    const updateCart = async (cartData: Carrinho): Promise<boolean> => {
        // Validação já deve ser feita na tela.
        setLoadingCarts(true);
        try {
            const result = await updateCartData(cartData);
            if (!result.success) {
                Alert.alert("Erro", result.message || "Não foi possível atualizar o carrinho.");
                return false;
            }
            setCarts(prevCarts => prevCarts.map(c => c.id === cartData.id ? cartData : c));
            Alert.alert("Sucesso", "Carrinho atualizado!");
            return true;
        } catch (error: any) {
            console.error("Erro ao atualizar carrinho:", error);
            Alert.alert("Erro", "Ocorreu um problema ao atualizar o carrinho.");
            return false;
        } finally {
            setLoadingCarts(false);
        }
    };

    const deleteCart = async (cartId: string): Promise<boolean> => {
        setLoadingCarts(true);
        try {
            const result = await deleteCartData(cartId);
            if (!result.success) {
                Alert.alert("Erro", result.message || "Não foi possível excluir o carrinho.");
                return false;
            }
            setCarts(prevCarts => prevCarts.filter(c => c.id !== cartId));
            Alert.alert("Sucesso", "Carrinho excluído!");
            return true;
        } catch (error: any) {
            console.error("Erro ao excluir carrinho:", error);
            Alert.alert("Erro", "Ocorreu um problema ao excluir o carrinho.");
            return false;
        } finally {
            setLoadingCarts(false);
        }
    };

    const resetCartsState = () => {
        setCarts([]);
        setLoadingCarts(false);
        setSelectedCart(null);
    };

    return (
        <CartsContext.Provider value={{
            carts,
            selectedCart,
            loadingCarts,
            fetchCarts,
            addCart,
            updateCart,
            deleteCart,
            resetCartsState,
            selectCartById,
            clearSelectedCart,
        }}>
            {children}
        </CartsContext.Provider>
    );
};