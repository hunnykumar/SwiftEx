
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';

const TxDetails = ({ route,showWebView }) => {
    const navigation = useNavigation();
    const { userKycUrl } = route.params || {};
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!userKycUrl) {
            navigation.goBack();
            Alert.alert("Error", "invalid url");
            setLoading(false);
        }
        showWebView(userKycUrl)
        navigation.goBack();
    }, [userKycUrl]);


    return (
        <View style={styles.container}>
            {/* <Exchange_screen_header elemetId={} elemetMenuId={} title="Info" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} /> */}
            {/* <WebView
                source={{ uri: userKycUrl }}
                style={styles.webview}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                }}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="green" />
                    <Text style={styles.loadingText}>Preparing Details...</Text>
                </View>
            )} */}
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

export default TxDetails;