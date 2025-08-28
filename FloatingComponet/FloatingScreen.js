import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    BackHandler,
    Alert,
    TouchableOpacity,
    Text,
    PanResponder,
    ActivityIndicator,
    Platform,
    Animated,
    KeyboardAvoidingView,
    Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from '../src/icon';

const FloatingScreen = ({ uri, visible, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const pos = useRef(new Animated.ValueXY({ x: 50, y: 50 })).current;
    const backHandler = useRef(null);
    const webViewRef = useRef(null);

    useEffect(() => {
        if (visible) {
            backHandler.current = BackHandler.addEventListener('hardwareBackPress', () => {
                if (isMinimized) {
                    Alert.alert("Info", "Do you want to exit?", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Yes", onPress: onClose },
                    ]);
                } else {
                    handleHeaderBack();
                }
                return true;
            });
        }

        return () => {
            if (backHandler.current) backHandler.current.remove();
        };
    }, [visible, isMinimized]);

    // Keyboard event listeners
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                // Inject JavaScript to scroll to focused element
                if (webViewRef.current && !isMinimized) {
                    webViewRef.current.injectJavaScript(`
                        setTimeout(() => {
                            const activeElement = document.activeElement;
                            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                                activeElement.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'center',
                                    inline: 'nearest'
                                });
                            }
                        }, 100);
                        true;
                    `);
                }
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, [isMinimized]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pos.setOffset({ x: pos.x._value, y: pos.y._value });
                pos.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], {
                useNativeDriver: false,
            }),
            onPanResponderRelease: () => pos.flattenOffset(),
        })
    ).current;

    const toggleSize = () => setIsMinimized(prev => !prev);

    const handleHeaderBack = () => {
        Alert.alert("Info", "Do you want to minimise this screen?", [
            { text: "Exit", onPress: onClose, style: "cancel" },
            { text: "Yes", onPress: () => { setIsMinimized(true), setShowControls(true) } },
            { text: "Cancel", style: "cancel" },
        ]);
    };

    const handleClosePress = () => {
        Alert.alert("Info", "Do you want to Exit?", [
            { text: "Cancel", style: "cancel" },
            { text: "Yes", onPress: onClose },
        ]);
    };

    const TopHeader = () => (
        <View style={[styles.headerContainer, { height: Platform.OS === "ios" ? hp(8) : hp(6) }]}>
            <TouchableOpacity onPress={handleHeaderBack} style={[styles.headerleftIconContainer, { marginTop: Platform.OS === "ios" ? hp(4) : 0 }]}>
                <Icon name="arrow-left" type="materialCommunity" size={30} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { marginTop: Platform.OS === "ios" ? hp(4) : 0 }]}>Info</Text>
            <View style={styles.headerrightIconContainer} />
        </View>
    );

    if (!visible) return null;

    return (
        <View style={styles.container} pointerEvents={isMinimized ? 'box-none' : 'auto'}>
            {isMinimized ? (
                <Animated.View
                    style={[styles.minimized, { transform: pos.getTranslateTransform() }]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.container} pointerEvents={isMinimized ? 'box-none' : 'auto'}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Icon name="information" type="materialCommunity" size={40} color="#333" />
                        </View>

                        {showControls && (
                            <View style={styles.controlsOverlay} pointerEvents="box-none">
                                <View style={styles.controls}>
                                    <TouchableOpacity onPress={toggleSize} style={styles.button}>
                                        <Icon name="fullscreen" type="materialCommunity" size={25} color="black" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleClosePress} style={styles.button}>
                                        <Icon name="close-circle-outline" type="materialCommunity" size={25} color="black" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </Animated.View>
            ) : (
                <KeyboardAvoidingView 
                    style={styles.full}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TopHeader />
                </KeyboardAvoidingView>
            )}

            <View
                pointerEvents={isMinimized ? 'none' : 'auto'}
                style={[
                    styles.webviewWrapper,
                    isMinimized ? styles.webviewHidden : styles.webviewVisible,
                    // Adjust bottom margin when keyboard is visible
                    !isMinimized && keyboardHeight > 0 && {
                        bottom: Platform.OS === 'ios' ? keyboardHeight : 0,
                        marginBottom: Platform.OS === 'android' ? keyboardHeight : 0,
                    }
                ]}
            >
                <WebView
                    ref={webViewRef}
                    source={{ uri }}
                    style={styles.webview}
                    onLoad={() => setLoading(false)}
                    onError={() => setLoading(false)}
                    // Enable automatic adjustment for keyboard
                    automaticallyAdjustContentInsets={true}
                    contentInsetAdjustmentBehavior="automatic"
                    // Allow zooming for better text input experience
                    scalesPageToFit={false}
                    // Improve keyboard handling
                    keyboardDisplayRequiresUserAction={false}
                    // JavaScript for better input handling
                    injectedJavaScript={`
                        // Function to handle input focus
                        function handleInputFocus() {
                            const inputs = document.querySelectorAll('input, textarea');
                            inputs.forEach(input => {
                                input.addEventListener('focus', function() {
                                    setTimeout(() => {
                                        this.scrollIntoView({ 
                                            behavior: 'smooth', 
                                            block: 'center',
                                            inline: 'nearest'
                                        });
                                    }, 300);
                                });
                            });
                        }
                        
                        // Run when page loads
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', handleInputFocus);
                        } else {
                            handleInputFocus();
                        }
                        
                        // Also run for dynamically added inputs
                        const observer = new MutationObserver(function(mutations) {
                            mutations.forEach(function(mutation) {
                                if (mutation.type === 'childList') {
                                    handleInputFocus();
                                }
                            });
                        });
                        
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                        
                        true; // Required for injected JavaScript
                    `}
                />
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="green" />
                        <Text style={styles.loadingText}>Preparing Details...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
    },
    full: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: Platform.OS === 'ios' ? hp(8) : hp(6),
        backgroundColor: '#011434',
        zIndex: 999,
    },
    minimized: {
        position: 'absolute',
        width: 200,
        height: 150,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        overflow: 'hidden',
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        padding: 5,
        zIndex: 1000,
    },
    controls: {
        flexDirection: 'row',
        borderRadius: 8,
        padding: 5,
        elevation: 4,
    },
    button: {
        marginHorizontal: 2,
        padding: 2,
    },
    webviewWrapper: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? hp(8) : hp(6),
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    webviewVisible: {
        zIndex: 1,
        opacity: 1,
    },
    webviewHidden: {
        zIndex: -1,
        opacity: 0,
        height: 0,
    },
    webview: {
        flex: 1,
        height: '100%',
        width: '100%',
    },

    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#011434',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#fff"
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 17,
        backgroundColor: '#011434',
    },
    headerleftIconContainer: {
        width: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 21,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerrightIconContainer: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
});

export default FloatingScreen;