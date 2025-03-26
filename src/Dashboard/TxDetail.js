
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Wallet_screen_header } from './reusables/ExchangeHeader';
import { useSelector } from 'react-redux';


export const TxDetail = ({route}) => {
    const state = useSelector((state) => state);
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
        <View style={[styles.container,{backgroundColor:state?.THEME?.THEME === true?"black":"white"}]}>
        <Wallet_screen_header title="Transactions" onLeftIconPress={() => navigation.goBack()} />
            <WebView
                source={{ uri: `${transactionPath}` }}
                style={styles.webview}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                }}
            />

            {loading && (
                <View style={[styles.loadingContainer,{backgroundColor:state?.THEME?.THEME === true?"black":"white"}]}>
                    <ActivityIndicator size="large" color="green" />
                    <Text style={[styles.loadingText,{color:state?.THEME?.THEME === true?"white":"black"}]}>Collecting Transaction Details...</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize:16,
        color:"#fff"
    },
});
