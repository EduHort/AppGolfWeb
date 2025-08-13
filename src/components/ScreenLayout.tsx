import React, { ReactNode } from 'react';
import { StyleSheet, StatusBar as ExpoStatusBar, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Surface } from 'react-native-paper';

interface ScreenLayoutProps {
    children: ReactNode;
    scrollable?: boolean; // Define se a tela deve ser rolável
}

export default function ScreenLayout({
    children,
    scrollable = true,
}: ScreenLayoutProps) {

    const cardContent = (
        <Surface style={styles.card} elevation={4}>
            {children}
        </Surface>
    );

    const content = scrollable ? (
        <KeyboardAwareScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid={true}
        >
            {cardContent}
        </KeyboardAwareScrollView>
    ) : (
        // Se não for rolável, usamos uma View.
        <View style={[styles.scrollView, styles.scrollContentContainer]}>
            {cardContent}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ExpoStatusBar
                barStyle="dark-content"
                backgroundColor="#f6f6f6"
                translucent={false}
            />
            {content}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f6f6f6',
    },
    scrollView: { // Aplicado tanto ao ScrollView quanto à View se não for rolável
        flex: 1, // Garante que ocupe o espaço disponível na SafeAreaView
    },
    scrollContentContainer: { // Estilo do container interno do ScrollView ou da View
        padding: 20, // Espaçamento ao redor do card
        flexGrow: 1, // Permite que o conteúdo (o card) cresça e seja centralizado
        justifyContent: 'center', // Centraliza o card verticalmente se o conteúdo for menor que a tela
        paddingBottom: 20,
    },
    card: { // Estilo do Surface (o card em si)
        padding: 24, // Espaçamento interno do card
        borderRadius: 12,
        elevation: 4,
        backgroundColor: '#fff', // Cor de fundo fixa para o card
    },
});