import { OfflineSurveyItem, SurveyData } from '../types/types';
import { saveSurveyData } from "../services/firestore";
import { verifyNet } from "../services/network";
import { OFFLINE_SURVEY_PREFIX, saveData } from "../services/storage";
import { validateAndCleanSurveyData } from "./validateSurvey";

export const saveSurveyFirebase = async (surveyData: SurveyData): Promise<{ success: boolean; message: string }> => {
    try {
        // Verifica se todos os campos obrigatórios estão preenchidos
        const validationResult = validateAndCleanSurveyData(surveyData);

        if (!validationResult.isValid) {
            const message = "Por favor, preencha ou verifique os seguintes campos:\n\n- " + validationResult.missingFields.join("\n- ");
            return { success: false, message: message };
        }

        const state = await verifyNet();
        if (state) {
            // --- Modo Online ---
            const result = await saveSurveyData(surveyData);
            if (result.success) {
                return { success: true, message: result.message };
            } else {
                // Falha ao enviar, mas pode prosseguir offline
                const saveResult = await saveOfflineSurveyLocal(surveyData);
                if (saveResult.success) {
                    return { success: true, message: "Não foi possível enviar os dados. A pesquisa foi salva em Verificar Pesquisas Pendentes para envio posterior.\n" + result.message };
                } else {
                    return { success: false, message: saveResult.message };
                }
            }
        } else {
            // --- Modo Offline ---
            const saveResult = await saveOfflineSurveyLocal(surveyData);
            if (saveResult.success) {
                return { success: true, message: "Você está offline. A pesquisa foi salva em Verificar Pesquisas Pendentes para envio posterior.\n" };
            } else {
                return { success: false, message: saveResult.message };
            }
        }
    } catch (error: any) {
        console.error("Erro geral no processo de submissão:", error);
        return { success: false, message: `Ocorreu um erro inesperado ao preparar a pesquisa: ${error.message}. Tente novamente.` };
    }
}

// REFAZER FUNÇÃO DE SALVAR OFFLINE

const saveOfflineSurveyLocal = async (surveyData: SurveyData): Promise<{ success: boolean; message: string }> => {
    try {
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
        const key = `${OFFLINE_SURVEY_PREFIX}${uniqueId}`;
        const dataWithMeta: OfflineSurveyItem = {
            id: uniqueId,
            savedAt: new Date().toISOString(),
            name: surveyData.cliente.nome,
            payload: surveyData,
            status: 'pendente' // Status inicial para itens offline
        };
        await saveData<OfflineSurveyItem>(key, dataWithMeta);

        return { success: true, message: "" };
    } catch (saveError) {
        // Falha ao salvar, e não pode prosseguir online
        return { success: false, message: "Falha ao salvar a pesquisa offline. Verifique o armazenamento e tente novamente." };
    }
}