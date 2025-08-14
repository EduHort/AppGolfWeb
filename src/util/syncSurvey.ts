import { verifyNet } from '../services/network';
import { OfflineSurveyItem } from '../types/types';
import { saveSurveyData } from '../services/firestore';
import { getOfflineSurveys, removeData } from '../services/storage';

// --- Função auxiliar para mandar os dados para o firebase ---
export const resendOfflineSurveys = async (): Promise<{ successCount: number; failCount: number; message?: string }> => {
    let successCount = 0;
    let failCount = 0;

    const state = await verifyNet(); // Verifica a conexão com a internet
    if (!state) {
        return { successCount, failCount, message: "Você está offline. Não é possível reenviar as pesquisas agora." }; // Retorna contagens atuais
    }

    console.log("Iniciando tentativa de reenvio de pesquisas offline...");

    try {
        // Pega todos os itens
        const items = await getOfflineSurveys();
        if (items.length === 0) {
            console.log("Nenhuma pesquisa pendente encontrada.");
            return { successCount: 0, failCount: 0, message: "Nenhuma pesquisa pendente encontrada." };
        }
        // Filtra e parseia apenas os pendentes válidos
        const pendingSurveys = items.filter(item => item.status === 'pendente' && item.payload);

        if (pendingSurveys.length === 0) {
            console.log("Nenhuma pesquisa com status 'pendente' encontrada.");
            return { successCount: 0, failCount: 0, message: "Nenhuma pesquisa com status 'pendente' encontrada." };
        }

        console.log(`Tentando reenviar ${pendingSurveys.length} pesquisas pendentes...`);

        // Itera e tenta reenviar UMA POR VEZ com um pequeno intervalo
        for (const surveyItem of pendingSurveys) {
            try {
                const response = await saveSurveyData(surveyItem.payload);
                if (response.success) {
                    console.log(`Pesquisa reenviada com sucesso: ${surveyItem.name}`);
                    // Remove o item do AsyncStorage após o envio
                    await removeData(surveyItem.originalKey);
                    successCount++;
                } else {
                    console.warn(`Falha ao reenviar pesquisa: ${surveyItem.name} - ${response.message}`);
                    failCount++;
                }
            } catch (error) {
                console.error(`Erro ao reenviar pesquisa: ${surveyItem.name} - ${error}`);
                failCount++;
            }

            await new Promise(resolve => setTimeout(resolve, 500)); // 0,5 segundo de intervalo
        }

        return { successCount, failCount };
    } catch (error) {
        return { successCount, failCount, message: "Erro crítico ao buscar e limpar pesquisas offline." }; // Retorna contagens atuais
    }
};

// --- Função auxiliar para carregar pesquisas para exibição ---
export const loadOfflineSurveysForDisplay = async (): Promise<(OfflineSurveyItem & { originalKey: string })[]> => {
    try {
        const items = await getOfflineSurveys();

        if (items.length === 0) {
            return [];
        }

        items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        return items;

    } catch (error) {
        console.error("Erro ao carregar pesquisas offline para exibição:", error);
        return []; // Retorna array vazio em caso de erro
    }
}