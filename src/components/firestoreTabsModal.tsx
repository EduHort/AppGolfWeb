import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { Text, TextInput, Button, Divider, IconButton } from 'react-native-paper';
import { FirestoreData, TabsData } from '../types/types';
import ScreenLayout from './Layout';
import { Picker } from '@react-native-picker/picker';

interface TabsDataEditModalProps {
    visible: boolean;
    onDismiss: () => void;
    onSave: (updatedTabsData: TabsData) => void;
    initialData: FirestoreData | null; // Agora recebemos o SurveyData completo
}

const TabsDataEditModal: React.FC<TabsDataEditModalProps> = ({ visible, onDismiss, onSave, initialData }) => {
    // O estado agora guarda o TabsData, que é a parte que estamos editando
    const [editableData, setEditableData] = useState<TabsData | null>(null);
    const [fieldCount, setFieldCount] = useState<number>(0);

    useEffect(() => {
        if (initialData) {
            const { surveyData: { carrinho, ...tabsData } } = initialData;

            // 1. Define a quantidade de campos a serem renderizados
            const count = parseInt(carrinho.quantidade, 10) || 0;
            setFieldCount(count);

            // 2. Prepara os dados editáveis
            const preparedData = JSON.parse(JSON.stringify(tabsData)); // Cópia profunda

            // Garante que os arrays de tensão e densidade tenham o tamanho correto
            preparedData.tensao = Array.from({ length: count }, (_, i) => preparedData.tensao?.[i] || '');
            preparedData.densidade = Array.from({ length: count }, (_, i) => preparedData.densidade?.[i] || '');

            setEditableData(preparedData);
        } else {
            setEditableData(null);
            setFieldCount(0);
        }
    }, [initialData]);

    // Handler para atualizar um item específico em um array (tensão ou densidade)
    const handleArrayFieldChange = useCallback((fieldType: 'tensao' | 'densidade', index: number, value: string) => {
        const sanitizedValue = value.replace(/[^0-9,.]/g, "").replace(",", ".");
        const parts = sanitizedValue.split(".");
        const finalValue = parts.length > 2
            ? `${parts[0]}.${parts.slice(1).join("")}`
            : sanitizedValue;

        setEditableData(prev => {
            // Se o estado anterior for nulo, não faz nada
            if (!prev) return null;

            // Cria uma cópia do array a ser modificado (seja 'tensao' ou 'densidade')
            const newArray = [...(prev[fieldType] || [])];

            // Atualiza o valor no índice específico
            newArray[index] = finalValue;

            // Retorna o novo objeto de estado com o array atualizado
            return { ...prev, [fieldType]: newArray };
        });
    }, []);

    // Handlers para os outros campos (reutilizados da versão anterior)
    const handleBatteryCheckChange = useCallback((field: keyof TabsData['verificarBateria'], value: string) => {
        setEditableData(prev => prev ? { ...prev, verificarBateria: { ...prev.verificarBateria, [field]: value } } : null);
    }, []);

    const handleCommentChange = useCallback((value: string) => {
        setEditableData(prev => prev ? { ...prev, comentario: value } : null);
    }, []);

    if (!editableData) return null;

    return (
        <Modal visible={visible} onDismiss={onDismiss} animationType="slide">
            <ScreenLayout>
                <View style={styles.modalHeader}>
                    <Text variant="headlineMedium" style={styles.modalTitle}>
                        Alterar Pesquisa
                    </Text>
                    <IconButton icon="close" onPress={onDismiss} />
                </View>
                <Divider />

                {/* === TENSÃO === */}
                <Text style={styles.sectionTitle}>Tensão</Text>
                {Array.from({ length: fieldCount }).map((_, index) => (
                    <TextInput
                        key={`tensao-${index}`}
                        label={`Tensão Bateria ${index + 1}`}
                        value={editableData.tensao[index] || ''}
                        onChangeText={text => handleArrayFieldChange('tensao', index, text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                    />
                ))}

                <Divider style={styles.divider} />

                {/* === DENSIDADE === */}
                <Text style={styles.sectionTitle}>Densidade</Text>
                {Array.from({ length: fieldCount }).map((_, index) => (
                    <TextInput
                        key={`densidade-${index}`}
                        label={`Densidade Bateria ${index + 1}`}
                        value={editableData.densidade?.[index] || ''}
                        onChangeText={text => handleArrayFieldChange('densidade', index, text)}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                    />
                ))}

                <Divider style={styles.divider} />

                {/* === VERIFICAÇÃO DA BATERIA === */}
                <Text style={styles.label}>Caixa da Bateria *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={editableData.verificarBateria.caixa}
                        onValueChange={(value) => handleBatteryCheckChange("caixa", value)}
                    >
                        <Picker.Item label="OK" value="OK" />
                        <Picker.Item label="Desgaste" value="desgaste" />
                    </Picker>
                </View>

                <Text style={styles.label}>Parafusos, Arruelas e Porcas *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={editableData.verificarBateria.parafusos}
                        onValueChange={(value) => handleBatteryCheckChange("parafusos", value)}
                    >
                        <Picker.Item label="OK" value="OK" />
                        <Picker.Item label="Limpeza" value="limpeza" />
                        <Picker.Item label="Fixados" value="fixados" />
                    </Picker>
                </View>

                <Text style={styles.label}>Terminais e Cabos *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={editableData.verificarBateria.terminais}
                        onValueChange={(value) => handleBatteryCheckChange("terminais", value)}
                    >
                        <Picker.Item label="OK" value="OK" />
                        <Picker.Item label="Desgaste" value="desgaste" />
                        <Picker.Item label="Limpeza" value="limpeza" />
                        <Picker.Item label="Fixados" value="fixados" />
                        <Picker.Item label="Oxidado" value="oxidado" />
                    </Picker>
                </View>

                <Text style={styles.label}>Polos *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={editableData.verificarBateria.polos}
                        onValueChange={(value) => handleBatteryCheckChange("polos", value)}
                    >
                        <Picker.Item label="OK" value="OK" />
                        <Picker.Item label="Solto" value="solto" />
                        <Picker.Item label="Desgaste" value="desgaste" />
                    </Picker>
                </View>

                <Text style={styles.label}>Nível da Água *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={editableData.verificarBateria.nivel}
                        onValueChange={(value) => handleBatteryCheckChange("nivel", value)}
                    >
                        <Picker.Item label="OK" value="OK" />
                        <Picker.Item label="Alto" value="alto" />
                        <Picker.Item label="Baixo" value="baixo" />
                        <Picker.Item label="Seco" value="seco" />
                        <Picker.Item label="Completado" value="completado" />
                        <Picker.Item label="Selado" value="selado" />
                    </Picker>
                </View>
                <Divider style={styles.divider} />

                {/* === COMENTÁRIOS === */}
                <Text style={styles.sectionTitle}>Comentários</Text>
                <TextInput
                    label="Comentário (opcional)"
                    value={editableData.comentario ?? ''}
                    onChangeText={handleCommentChange}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                />
                <Button mode="contained" onPress={() => onSave(editableData)} style={styles.button}>
                    Salvar
                </Button>
                <Button onPress={onDismiss} style={styles.button}>
                    Fechar
                </Button>
            </ScreenLayout>
        </Modal>
    );
};

// ... estilos (mantidos da versão anterior)
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
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    label: { fontSize: 16, marginBottom: 4 },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 16,
        overflow: "hidden",
    },
});


export default TabsDataEditModal;