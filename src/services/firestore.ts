import { addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { questionariosCollection, clientesCollection, serverTimestamp, carrinhosCollection } from '../firebase';
import { Carrinho, Cliente, FirestoreData, SurveyData } from '../types/types';

export async function saveSurveyData(survey: SurveyData): Promise<{ success: boolean; message: string; id?: string }> {
    try {
        const firestoreData: FirestoreData = {
            surveyData: survey,
            status: 'pendente',
            enviadoEm: serverTimestamp(),
        };
        const docRef = await addDoc(questionariosCollection, firestoreData);
        return { success: true, message: "Dados enviados com sucesso.", id: docRef.id };
    } catch (error) {
        console.error("Erro ao enviar dados para o Firestore:", error);
        return { success: false, message: "Falha ao enviar os dados. Tente novamente." };
    }
}

export async function getSurveysByCartId(id: string): Promise<(FirestoreData)[] | null> {
    try {
        const q = query(questionariosCollection, where("surveyData.carrinho.id", "==", id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        const surveys: (FirestoreData)[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as FirestoreData;
            surveys.push({ ...data, id: doc.id });
        });
        return surveys;
    } catch (error) {
        console.error("Erro ao buscar pesquisas pelo telefone:", error);
        return null;
    }
}

export async function updateSurveyData(surveyData: FirestoreData): Promise<{ success: boolean; message: string }> {
    try {
        const { id, ...surveyDataSemId } = surveyData;
        const docRef = doc(questionariosCollection, id);
        await updateDoc(docRef, {
            surveyData: surveyDataSemId,
            status: 'pendente',
            atualizadoEm: serverTimestamp()
        });
        return { success: true, message: "Dados atualizados com sucesso." };
    } catch (error) {
        console.error("Erro ao atualizar dados no Firestore:", error);
        return { success: false, message: "Falha ao atualizar os dados. Tente novamente." };
    }
}

export async function deleteSurveyData(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const docRef = doc(questionariosCollection, id);
        await deleteDoc(docRef);
        return { success: true, message: "Dados excluídos com sucesso." };
    } catch (error) {
        console.error("Erro ao excluir dados:", error);
        return { success: false, message: "Falha ao excluir os dados." };
    }
}

export async function saveClientData(cliente: Cliente): Promise<{ success: boolean; message: string; id?: string }> {
    try {
        const clientData: Cliente = {
            ...cliente,
            enviadoEm: serverTimestamp(),
        };

        const docRef = await addDoc(clientesCollection, clientData);
        return { success: true, message: "Dados do cliente salvos com sucesso.", id: docRef.id };
    } catch (error) {
        console.error("Erro ao salvar dados do cliente:", error);
        return { success: false, message: "Falha ao salvar os dados do cliente." };
    }
}

export async function getClientByPhone(fone: string): Promise<(Cliente & { id: string }) | null> {
    try {
        const q = query(clientesCollection, where("fone", "==", fone));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const data = querySnapshot.docs[0].data() as Cliente;
        return { ...data, id: querySnapshot.docs[0].id };
    } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
        return null;
    }
}

export async function updateClientData(cliente: Cliente): Promise<{ success: boolean; message: string }> {
    try {
        const { id, ...clienteSemId } = cliente;
        const docRef = doc(clientesCollection, id);
        await updateDoc(docRef, {
            ...clienteSemId,
            atualizadoEm: serverTimestamp()
        });
        return { success: true, message: "Dados do cliente atualizados com sucesso." };
    } catch (error) {
        console.error("Erro ao atualizar dados do cliente:", error);
        return { success: false, message: "Falha ao atualizar os dados do cliente." };
    }
}

export async function saveCartData(carrinho: Carrinho): Promise<{ success: boolean; message: string, id?: string }> {
    try {
        const cartData: Carrinho = {
            ...carrinho,
            enviadoEm: serverTimestamp(),
        };

        const docRef = await addDoc(carrinhosCollection, cartData);
        return { success: true, message: "Dados do carrinho salvos com sucesso.", id: docRef.id };
    } catch (error) {
        console.error("Erro ao salvar dados do carrinho:", error);
        return { success: false, message: "Falha ao salvar os dados do carrinho." };
    }
}

// Retorna todos os carrinhos de um cliente
export async function getCartsData(dono: string): Promise<(Carrinho & { id: string })[] | null> {
    try {
        const q = query(carrinhosCollection, where("dono", "==", dono));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }

        const cartData: (Carrinho & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as Carrinho;
            cartData.push({ ...data, id: doc.id });
        });
        return cartData;
    } catch (error) {
        console.error("Erro ao buscar dados do carrinho:", error);
        return null;
    }
}

export async function updateCartData(carrinho: Carrinho): Promise<{ success: boolean; message: string }> {
    try {
        const { id, ...carrinhoSemId } = carrinho;
        const docRef = doc(carrinhosCollection, id);
        await updateDoc(docRef, { ...carrinhoSemId, atualizadoEm: serverTimestamp() });
        return { success: true, message: "Dados do carrinho atualizados com sucesso." };
    } catch (error) {
        console.error("Erro ao atualizar dados do carrinho:", error);
        return { success: false, message: "Falha ao atualizar os dados do carrinho." };
    }
}

export async function deleteCartData(id: string): Promise<{ success: boolean; message: string }> {
    try {
        const docRef = doc(carrinhosCollection, id);
        await deleteDoc(docRef);
        return { success: true, message: "Dados do carrinho excluídos com sucesso." };
    } catch (error) {
        console.error("Erro ao excluir dados do carrinho:", error);
        return { success: false, message: "Falha ao excluir os dados do carrinho." };
    }
}