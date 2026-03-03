import React, { useState, useEffect, useRef } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const TokenTransferFlow = ({
    visible = false,
    fistToken = 'ETH',
    statusMap = {},
    onClose
}) => {
    const [showNotification, setShowNotification] = useState(false);
    const progressAnimation = useRef(new Animated.Value(0)).current;
    const prevCompletedStepsRef = useRef(0);

    const tokens = [
        { from: fistToken, to: 'USDT', key: `${fistToken}→USDT` },
        { from: 'USDT', to: 'USDC', key: 'USDT→USDC' },
        { from: 'USDC', to: 'Wallet', key: 'USDC→Wallet' }
    ];

    useEffect(() => {
        if (!visible) {
            // Reset when not visible
            progressAnimation.setValue(0);
            prevCompletedStepsRef.current = 0;
            setShowNotification(false);
            return;
        }

        let completedSteps = 0;
        tokens.forEach(token => {
            if (statusMap[token.key] === 'done') completedSteps++;
        });

        // Only update if number of completed steps has changed
        if (completedSteps !== prevCompletedStepsRef.current) {
            // Calculate progress (ensuring it maxes at 100%)
            const newProgress = Math.min(completedSteps * (100 / 3), 100);

            // Animate progress bar from current value to new value
            Animated.timing(progressAnimation, {
                toValue: newProgress,
                duration: 600, // Animation duration in ms
                useNativeDriver: false
            }).start();

            // Update reference for next comparison
            prevCompletedStepsRef.current = completedSteps;
        }

        // Show notification when all steps are complete
        if (completedSteps === tokens.length) {
            setShowNotification(true);
        } else {
            setShowNotification(false);
        }
    }, [visible, statusMap, progressAnimation, tokens]);

    // For display in the text element
    const [progressTextValue, setProgressTextValue] = useState(0);

    // Update the text value when animation changes
    useEffect(() => {
        const listener = progressAnimation.addListener(({ value }) => {
            setProgressTextValue(Math.round(value));
        });

        return () => {
            progressAnimation.removeListener(listener);
        };
    }, [progressAnimation]);

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Token Transfer Flow</Text>
            </View>

            <View style={styles.tokenTransferContainer}>
                {tokens.map((token) => {
                    const status = statusMap[token.key] || 'default';
                    const isCompleted = status === 'done';
                    const isError = status === 'error';
                    const isPending = status === 'pending';

                    return (
                        <View key={token.key} style={styles.tokenStep}>
                            <View style={[
                                styles.tokenCircle,
                                isCompleted ? styles.completedTokenCircle : {},
                                isPending ? styles.pendingTokenCircle : {},
                                isError ? styles.errorTokenCircle : {},
                                !isCompleted && !isPending && !isError ? styles.defaultTokenCircle : {},
                            ]}>
                                <MaterialCommunityIcons
                                    name={
                                        isCompleted ? 'check-circle'
                                            : isError ? 'close-circle'
                                                : isPending ? 'timer-outline'
                                                    : 'swap-horizontal'
                                    }
                                    size={32}
                                    color={
                                        isCompleted ? '#10B981'
                                            : isError ? '#EF4444'
                                                : isPending ? '#FBBF24'
                                                    : '#9CA3AF'
                                    }
                                />
                            </View>
                            <Text style={[
                                styles.tokenText,
                                isCompleted ? styles.completedTokenText : {},
                                isError ? styles.errorTokenText : {},
                                isPending ? styles.pendingTokenText : {},
                                !isCompleted && !isPending && !isError ? styles.defaultTokenText : {},
                            ]}>
                                {token.from} <MaterialCommunityIcons
                                    name={"arrow-right"} size={15}
                                    color={isCompleted ? '#10B981' : isError ? '#EF4444' : isPending ? '#FBBF24' : '#9CA3AF'} /> {token.to}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {showNotification ? (
                <View style={styles.notificationContainer}>
                    <Text style={styles.notificationText}>We'll notify you when complete.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => { onClose() }}>
                        <Text style={styles.buttonText}>Okay</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Progress: {progressTextValue}%
                    </Text>
                    <View style={styles.progressBarBackground}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: progressAnimation.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        width: wp(98),
        maxWidth: 400,
        alignSelf: 'center',
        backgroundColor: '#111111',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F0F9FF',
    },
    tokenTransferContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    tokenStep: {
        alignItems: 'center',
    },
    tokenCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    defaultTokenCircle: {
        borderColor: '#9CA3AF',
        backgroundColor: '#E5E7EB',
    },
    completedTokenCircle: {
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    pendingTokenCircle: {
        borderColor: '#FBBF24',
        backgroundColor: '#FEF9C3',
    },
    errorTokenCircle: {
        borderColor: '#EF4444',
        backgroundColor: '#FEE2E2',
    },
    tokenText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6B7280',
    },
    completedTokenText: {
        color: '#10B981',
        fontWeight: 'bold',
    },
    pendingTokenText: {
        color: '#F59E0B',
        fontWeight: 'bold',
    },
    errorTokenText: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
    defaultTokenText: {
        color: '#9CA3AF',
    },
    progressContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    progressText: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 9999,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#3B82F6',
        borderRadius: 9999,
    },
    notificationContainer: {
        borderRadius: 8,
        padding: 12,
        width: '100%',
    },
    notificationText: {
        fontSize: 14,
        color: '#1E40AF',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: "#4052D6",
        justifyContent: "center",
        alignItems: "center",
        marginTop: hp(0.6),
        marginBottom: hp(0.6),
        padding: 14,
        borderRadius: 20

    },
    buttonText: {
        fontSize: 19,
        color: "#fff",
        fontWeight: "600"
    },
});