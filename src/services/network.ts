import NetInfo from '@react-native-community/netinfo';

export const verifyNet = async () => {
    try {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected && netInfo.isInternetReachable) {
            return true;
        } else {
            return false;
        }
    }
    catch (error) {
        console.warn("Erro ao verificar estado da rede:", error);
        return false;
    }
}