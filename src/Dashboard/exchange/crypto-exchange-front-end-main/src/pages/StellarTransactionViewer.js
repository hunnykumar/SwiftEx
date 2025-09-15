
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { STELLAR_URL } from '../../../../constants';

const StellarTransactionViewer = ({ route }) => {
    const navigation = useNavigation();
    const { transactionPath } = route.params || {};
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!transactionPath) {
            navigation.goBack();
            Alert.alert("Error", "invalid url");
            setLoading(false);
        }
    }, [transactionPath]);


    return (
        <View style={styles.container}>
            <Exchange_screen_header elemetId={"transactions_back"} elemetMenuId={"transactions_menu"} title="Transactions" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
            <WebView
                source={{ uri: `${STELLAR_URL.EXPERT_URL}/tx/${transactionPath}` }}
                style={styles.webview}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                }}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="green" />
                    <Text style={styles.loadingText}>Loading Transaction Details...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#011434',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#011434',
    },
    loadingText: {
        marginTop: 10,
        fontSize:16,
        color:"#fff"
    },
});

export default StellarTransactionViewer;