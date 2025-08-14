import { Carrinho, Cliente, SurveyData } from "../types/types";

interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
}

export const validateAndCleanSurveyData = (data: SurveyData | null): ValidationResult => {
    const missingFields: string[] = [];

    // Se o objeto principal for nulo, não há o que validar/limpar
    if (!data) {
        return { isValid: false, missingFields: ["Dados principais não encontrados."] };
    }

    // --- 1. Limpeza de Campos Opcionais ---
    if (data.densidade != null && data.densidade.every(item => item.trim() === "")) {
        data.densidade = null;
    } else if (data.densidade && data.densidade.some(t => !t?.trim())) {
        missingFields.push("Densidade: Pelo menos uma densidade não foi preenchida");
    }
    // Limpa o comentário se o objeto comentário existir e seu conteúdo for vazio/espaços
    if (data.comentario && data.comentario != null && data.comentario.trim() === "") {
        data.comentario = null;
    }

    // --- 2. Validação de Campos Obrigatórios ---
    if (!data.usuario?.nome?.trim()) missingFields.push("Início: Usuário");
    if (!data.usuario?.cidade?.trim()) missingFields.push("Início: Cidade");
    if (!data.usuario?.estado?.trim()) missingFields.push("Início: Estado");
    if (!data.usuario?.clube?.trim()) missingFields.push("Início: Clube");

    // Verifica tensões: se o objeto existe, se o array existe e não está vazio, e se não há entradas vazias dentro
    if (!data.tensao || data.tensao.length === 0) {
        missingFields.push("Tensão: Nenhuma tensão registrada");
    } else if (data.tensao.some(t => !t?.trim())) {
        missingFields.push("Tensão: Pelo menos uma tensão não foi preenchida");
    }

    // Retorna o resultado
    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
};

export const validateClient = (client: Cliente): ValidationResult => {
    const missingFields: string[] = [];

    if (!client.nome?.trim()) missingFields.push("Nome do cliente");
    if (!client.fone?.trim()) {
        missingFields.push("Celular do cliente");
    } else {
        const cleanedFone = client.fone.replace(/\D/g, ''); // Remove não-dígitos
        if (!(cleanedFone.length === 10 || cleanedFone.length === 11)) {
            missingFields.push("Celular inválido (use DDD + número, 10 ou 11 dígitos)");
        }
    }

    if (client.email && client.email.trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(client.email)) {
            missingFields.push("E-mail inválido");
        }
    } else {
        client.email = null; // Limpa o campo se não for válido
    }
    if (!client.clube?.trim()) missingFields.push("Clube do cliente");
    if (!client.cidade?.trim()) missingFields.push("Cidade do cliente");
    if (!client.estado?.trim()) missingFields.push("Estado do cliente");

    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
}

export const validateCarrinho = (carrinho: Carrinho): ValidationResult => {
    const missingFields: string[] = [];

    if (!carrinho.marca?.trim()) missingFields.push("Marca do carrinho");
    if (!carrinho.marcaBat?.trim()) missingFields.push("Marca da bateria");
    if (!carrinho.tipo?.trim()) missingFields.push("Tipo da bateria");
    if (!carrinho.tensao?.trim()) missingFields.push("Tensão da bateria");
    if (!carrinho.quantidade?.trim()) missingFields.push("Quantidade da bateria");
    //if (!carrinho.cor?.trim()) missingFields.push("Cor do carrinho");

    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
}

export const validateFullSurvey = (survey: SurveyData | null): ValidationResult => {
    const missingFields: string[] = [];

    if (!survey) {
        return { isValid: false, missingFields: ["Dados do levantamento não encontrados."] };
    }

    validateAndCleanSurveyData(survey);
    const carrinhoValidation = validateCarrinho(survey.carrinho);
    const clienteValidation = validateClient(survey.cliente);

    missingFields.push(...carrinhoValidation.missingFields);
    missingFields.push(...clienteValidation.missingFields);

    return {
        isValid: missingFields.length === 0,
        missingFields: missingFields
    };
};
