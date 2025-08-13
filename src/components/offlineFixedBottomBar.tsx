import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Alert, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { saveSurveyFirebase } from '../util/saveSurvey';
import { useOfflineSurvey } from "../context/offlineSurveyContext";
import { SurveyData, Usuario } from '../types/types';
import { AsyncStorageKeys, getData } from '../services/asyncStorage';
import { validateFullSurvey } from '../util/validateSurvey';

export default function OfflineFixedBottomBar() {
    const router = useRouter();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { surveyData, resetSurvey } = useOfflineSurvey();

    useEffect(() => {
        // Lógica dos listeners do teclado
        const keyboardDidShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const keyboardDidHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const keyboardDidShowListener = Keyboard.addListener(keyboardDidShowEvent, () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener(keyboardDidHideEvent, () => setKeyboardVisible(false));
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleFinalize = async () => {
        const usuario = await getData<Usuario>(AsyncStorageKeys.USER_DATA);
        if (!usuario || !surveyData) {
            Alert.alert("Erro", "Dados Faltando. Caso tenha problemas, reinicie o aplicativo.");
            return;
        }

        const survey: SurveyData = {
            usuario: usuario,
            carrinho: surveyData.carrinho,
            cliente: surveyData.cliente,
            tensao: surveyData.tensao,
            densidade: surveyData.densidade,
            comentario: surveyData.comentario,
            verificarBateria: surveyData.verificarBateria
        };

        Alert.alert(
            "Confirmar Finalização", "Tem certeza que deseja finalizar a pesquisa?",
            [
                { text: "Cancelar", onPress: () => { }, style: "cancel" },
                {
                    text: "Confirmar", onPress: async () => {
                        const validateSurvey = validateFullSurvey(survey);
                        if (!validateSurvey.isValid) {
                            const message = "Por favor, preencha ou verifique os seguintes campos:\n\n- " + validateSurvey.missingFields.join("\n- ");
                            Alert.alert("Erro", message, [{ text: "OK" }]);
                            return;
                        }
                        setLoading(true);
                        try {
                            const response = await saveSurveyFirebase(survey);
                            if (response.success) {
                                resetSurvey();
                                Alert.alert("Sucesso", response.message, [{ text: "OK", onPress: () => router.push('/') }]);
                            } else {
                                Alert.alert("Erro", response.message, [{ text: "OK" }]);
                            }
                        } catch (error) {
                            Alert.alert("Erro", "Ocorreu um erro ao enviar os dados.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ],
            { cancelable: true }
        );
    };

    const handleBackToHome = () => {
        Alert.alert(
            "Confirmar Voltar", "Tem certeza que deseja voltar para a tela inicial? Todos os dados dessa pesquisa serão perdidos.",
            [
                { text: "Cancelar", onPress: () => { }, style: "cancel" },
                {
                    text: "Confirmar", onPress: () => {
                        resetSurvey(); // Limpa os dados da pesquisa offline
                        router.push('/'); // Navega para a tela inicial
                    }
                }
            ],
            { cancelable: true }
        );
    };

    // Renderiza a barra de botões APENAS se o teclado não estiver visível
    if (isKeyboardVisible) {
        return null; // Não renderiza nada se o teclado estiver visível
    }

    return (
        <View style={styles.bottomButtonContainer}>
            <IconButton
                icon="home"
                iconColor="black"
                size={24}
                onPress={() => handleBackToHome()}
                accessibilityLabel="Voltar para a tela inicial"
                style={styles.iconOnly}
            />

            <Button
                mode="contained"
                onPress={handleFinalize}
                style={styles.finalizeButton}
                contentStyle={styles.finalizeButtonContent}
                theme={{ roundness: 2 }}
                buttonColor="black"
                textColor='white'
                loading={loading}
                disabled={loading}
            >
                Finalizar Pesquisa
            </Button>
        </View>
    );
}

// Estilos específicos para a barra de botões
const styles = StyleSheet.create({
    bottomButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f6f6f6',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    iconOnly: {
        marginRight: 10,
        backgroundColor: 'transparent',
        alignSelf: 'center',
    },
    finalizeButton: {
        flex: 3,
        borderRadius: 8,
    },
    finalizeButtonContent: {
        paddingVertical: 8,
    },
});