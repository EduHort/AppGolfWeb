// Local: src/lib/storage.ts

export enum AsyncStorageKeys {
    USER_DATA = "userData",
    CLIENT_DATA = "clientData",
    CART_DATA = "cartData",
    CARTS_DATA = "cartsData",
    VOLTAGE_DATA = "voltageData",
    DENSITY_DATA = "densityData",
    COMENTARIO_DATA = "comentario",
    TABS_DATA = "tabsData"
};

/**
 * Salva um valor no localStorage do navegador.
 * @param key A chave para o armazenamento.
 * @param value O valor a ser salvo (será convertido para JSON).
 */
export function saveData<T>(key: AsyncStorageKeys | string, value: T): void {
    try {
        // Garante que o código só rode no ambiente do navegador.
        if (typeof window !== 'undefined') {
            const jsonData = JSON.stringify(value);
            localStorage.setItem(key, jsonData);
        }
    } catch (error) {
        console.error(`Erro ao salvar dados para a chave ${key}:`, error);
        throw error;
    }
}

/**
 * Busca um valor do localStorage do navegador.
 * @param key A chave do valor a ser buscado.
 * @returns O valor encontrado (convertido de JSON) ou null se não existir.
 */
export function getData<T>(key: AsyncStorageKeys | string): T | null {
    try {
        if (typeof window === 'undefined') {
            return null;
        }

        const jsonData = localStorage.getItem(key);
        return jsonData ? (JSON.parse(jsonData) as T) : null;
    } catch (error) {
        console.error(`Erro ao buscar dados para a chave ${key}:`, error);
        return null;
    }
}

/**
 * Remove um valor específico do localStorage.
 * @param key A chave a ser removida.
 */
export function removeData(key: AsyncStorageKeys | string): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    } catch (error) {
        console.error(`Erro ao remover dados para a chave ${key}:`, error);
    }
}

/**
 * Limpa os dados de um formulário de pesquisa em andamento.
 * Esta função continua útil para "resetar" o formulário.
 */
export function clearTemporarySurveyData(): void {
    const keysToRemove = [
        AsyncStorageKeys.VOLTAGE_DATA,
        AsyncStorageKeys.CART_DATA,
        AsyncStorageKeys.CARTS_DATA,
        AsyncStorageKeys.CLIENT_DATA,
        AsyncStorageKeys.DENSITY_DATA,
        AsyncStorageKeys.COMENTARIO_DATA
    ];

    for (const key of keysToRemove) {
        removeData(key);
    }
}