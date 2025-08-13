import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Alert, Platform } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { saveSurveyFirebase } from '../util/saveSurvey';
import { useCarts } from '../context/cartsContext';
import { useTabs } from '../context/tabsContext';
import { useClient } from "../context/clientContext";
import { SurveyData, Usuario } from '../types/types';
import { AsyncStorageKeys, getData } from '../services/asyncStorage';

export default function FixedBottomBar() {
  const router = useRouter();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tabsData, resetTabsData } = useTabs();
  const { selectedCart, resetCartsState } = useCarts();
  const { resetClientContextState, client } = useClient();

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
    if (!usuario || !selectedCart || !tabsData || !selectedCart.id || !client) {
      Alert.alert("Erro", "Dados Faltando. Caso tenha problemas, reinicie o aplicativo.");
      return;
    }

    const { id, ...carrinho } = selectedCart; // Remove o id do carrinho, se existir
    const { id: clientId, ...clientNoId } = client;

    const survey: SurveyData = {
      usuario: usuario,
      carrinho: carrinho,
      cliente: clientNoId,
      tensao: tabsData.tensao,
      densidade: tabsData.densidade,
      comentario: tabsData.comentario,
      verificarBateria: tabsData.verificarBateria
    };

    Alert.alert(
      "Confirmar Finalização", "Tem certeza que deseja finalizar a pesquisa?",
      [
        { text: "Cancelar", onPress: () => { }, style: "cancel" },
        {
          text: "Confirmar", onPress: async () => {
            setLoading(true);
            try {
              const response = await saveSurveyFirebase(survey);
              if (response.success) {
                resetCartsState();
                resetTabsData();
                resetClientContextState();
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

  // Renderiza a barra de botões APENAS se o teclado não estiver visível
  if (isKeyboardVisible) {
    return null; // Não renderiza nada se o teclado estiver visível
  }

  return (
    <View style={styles.bottomButtonContainer}>
      {router.canGoBack() && (
        <IconButton
          icon="arrow-left"
          mode="contained"
          iconColor="black"
          size={24}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          style={styles.iconOnly}
        />
      )}

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
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
});