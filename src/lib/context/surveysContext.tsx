import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { FirestoreData } from '../types/types';
import { getSurveysByCartId, deleteSurveyData, updateSurveyData } from '../services/firestore';
import { useCarts } from "../context/cartsContext";

interface SurveysContextType {
  surveys: FirestoreData[];
  loadingSurveys: boolean;
  deleteSurvey: (firestoreDocId: string) => Promise<boolean>;
  resetSurveysState: () => void;
  updateTabsData: (data: FirestoreData) => Promise<boolean>;
}

const SurveysContext = createContext<SurveysContextType | undefined>(undefined);

export const useSurveys = () => {
  const context = useContext(SurveysContext);
  if (!context) {
    throw new Error('useSurveys deve ser usado dentro de um SurveysProvider');
  }
  return context;
};

interface SurveysProviderProps {
  children: ReactNode;
}

export const SurveysProvider: React.FC<SurveysProviderProps> = ({ children }) => {
  const [surveys, setSurveys] = useState<FirestoreData[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState(false);
  const { selectedCart } = useCarts();

  useEffect(() => {
    // Pega o ID do carrinho. Se não houver, o ID será undefined.
    const cartId = selectedCart?.id;

    if (cartId) {
      console.log(`[SurveysContext] O carrinho selecionado mudou para ${cartId}. Buscando pesquisas...`);
      setLoadingSurveys(true);
      getSurveysByCartId(cartId)
        .then(data => setSurveys(data || []))
        .catch(error => {
          console.error("Erro ao buscar surveys no contexto:", error);
          Alert.alert("Erro", "Não foi possível carregar os questionários.");
          setSurveys([]);
        })
        .finally(() => setLoadingSurveys(false));
    } else {
      // Se não houver carrinho selecionado, limpa a lista de pesquisas.
      console.log("[SurveysContext] Nenhum carrinho selecionado. Limpando pesquisas.");
      setSurveys([]);
      setLoadingSurveys(false);
    }
  }, [selectedCart?.id]);

  const updateTabsData = async (data: FirestoreData): Promise<boolean> => {
    if (!data || !data.id) {
      Alert.alert("Erro", "Dados inválidos para atualização.");
      return false;
    }

    setLoadingSurveys(true);
    try {
      // 2. Envia o objeto completo para o Firestore
      const result = await updateSurveyData(data);
      if (!result.success) {
        Alert.alert("Erro", result.message || "Dados inválidos para atualização.");
        return false;
      }

      // 3. Atualiza o estado local
      setSurveys(prevSurveys =>
        prevSurveys.map(survey => (survey.id === data.id ? { ...survey, ...data } : survey))
      );
      Alert.alert("Sucesso", "Dados da bateria atualizados!");
      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar survey:", error);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
      return false;
    } finally {
      setLoadingSurveys(false);
    }
  };

  const deleteSurvey = async (firestoreDocId: string): Promise<boolean> => {
    setLoadingSurveys(true);
    try {
      const result = await deleteSurveyData(firestoreDocId);
      if (!result.success) {
        Alert.alert("Erro", result.message || "Não foi possível excluir o questionário.");
        return false;
      }
      // Filtra usando o 'id' do FirestoreData (que é o doc.id)
      setSurveys(prevSurveys => prevSurveys.filter(s => s.id !== firestoreDocId));
      Alert.alert("Sucesso", "Questionário excluído!");
      return true;
    } catch (error: any) {
      console.error("Erro ao excluir survey:", error);
      Alert.alert("Erro", "Ocorreu um problema ao excluir o questionário.");
      return false;
    } finally {
      setLoadingSurveys(false);
    }
  };

  const resetSurveysState = useCallback(() => {
    setSurveys([]);
    setLoadingSurveys(false);
  }, []);

  return (
    <SurveysContext.Provider value={{
      surveys,
      loadingSurveys,
      deleteSurvey,
      resetSurveysState,
      updateTabsData
    }}>
      {children}
    </SurveysContext.Provider>
  );
};