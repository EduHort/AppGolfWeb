import React from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { TextInput, Divider, Button, IconButton, Text } from 'react-native-paper';
import { FirestoreData } from '../types/types';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import ScreenLayout from './Layout';

interface FirestoreDataModalProps {
    visible: boolean;
    onDismiss: () => void;
    surveyData: FirestoreData | null;
}

const FirestoreDataModal: React.FC<FirestoreDataModalProps> = ({ visible, onDismiss, surveyData }) => {
    if (!surveyData) {
        return null;
    }

    // Helper para formatar datas, tratando casos onde a data pode não existir
    const formatDate = (date: Timestamp | undefined) => {
        if (date && typeof date.toDate === 'function') {
            return format(date.toDate(), "dd/MM/yyyy 'às' HH:mm:ss");
        }
        return "Não disponível";
    };

    // Helper para formatar valores booleanos de forma legível
    const formatBoolean = (value: boolean | undefined) => {
        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }
        return 'Não disponível';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onDismiss={onDismiss}
        >
            <ScreenLayout>
                <View style={styles.modalHeader}>
                    <Text variant="headlineMedium" style={styles.modalTitle}>
                        Informações da Pesquisa
                    </Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </View>

                <TextInput
                    label="Status Geral"
                    value={surveyData.status}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="Status do E-mail"
                    value={surveyData.emailStatus ?? 'Não aplicável'}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="Status do WhatsApp"
                    value={surveyData.whatsStatus ?? 'Não enviado'}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="PDF Gerado"
                    value={formatBoolean(surveyData.pdfGerado)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />

                <Divider style={styles.divider} />

                <TextInput
                    label="Data de Envio"
                    value={formatDate(surveyData.enviadoEm as Timestamp)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="Início do Processamento"
                    value={formatDate(surveyData.processadoInicioEm)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="Fim do Processamento"
                    value={formatDate(surveyData.processadoFimEm)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />
                <TextInput
                    label="Última Atualização"
                    value={formatDate(surveyData.atualizadoEm)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                />

                {/* Exibe a mensagem de erro apenas se ela existir */}
                {surveyData.mensagemErro && (
                    <>
                        <Divider style={styles.divider} />
                        <TextInput
                            label="Mensagem de Erro"
                            value={surveyData.mensagemErro}
                            mode="outlined"
                            editable={false}
                            multiline
                            style={styles.input}
                            // A prop 'error' do TextInput do Paper destaca o campo em vermelho
                            error={true}
                        />
                    </>
                )}
                <Button onPress={onDismiss} style={styles.button} mode="contained" icon="close" color="#f44336">
                    Fechar
                </Button>
            </ScreenLayout>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        padding: 20,
    },
    card: {
        width: '100%',
        maxHeight: '90%', // Impede que o modal ocupe a tela inteira
    },
    cardTitle: {
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#f6f6f6',
    },
    divider: {
        marginVertical: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontWeight: "bold",
        color: "black",
        flex: 1,
        textAlign: 'center',
        marginLeft: 40,
    },
    button: {
        marginVertical: 8,
        borderRadius: 8,
    },
});

export default FirestoreDataModal;