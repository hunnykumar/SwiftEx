import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  useColorScheme,
  BackHandler
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";

const { height } = Dimensions.get('window');

const WalletActivationComponent = ({ 
  isVisible = false, 
  onClose, 
  onActivate, 
  appTheme,
  navigation = null,
  shouldNavigateBack = false
}) => {
  const isDarkMode = appTheme;
  
  // Use refs to avoid re-creating animation instances
  const animationRef = useRef(new Animated.Value(height));
  const animation = animationRef.current;
  
  // Use refs to track visible state to avoid race conditions
  const visibleRef = useRef(isVisible);
  const [showSheet, setShowSheet] = useState(isVisible);
  
  // Prevent animation conflicts
  const animatingRef = useRef(false);

  // Theme colors
  const theme = {
    background: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#333333',
    secondaryText: isDarkMode ? '#AAAAAA' : '#666666',
    accentColor: '#4F8EF7',
    accentBackground: isDarkMode ? '#2C3E50' : '#EBF2FF',
    handleColor: isDarkMode ? '#555555' : '#E0E0E0',
    backdropColor: 'rgba(0, 0, 0, 0.7)'
  };

  // Function to handle closing and navigation
  const handleClose = () => {
    // First close the sheet
    if (typeof onClose === 'function') {
      onClose();
    }
    
    // Then navigate back if needed
    if (shouldNavigateBack && navigation && navigation.canGoBack()) {
      // Use a short timeout to ensure the sheet starts closing first
        navigation.goBack();
    }
  };

  // Handle back button press on Android
  useEffect(() => {
    const handleBackPress = () => {
      if (showSheet) {
        handleClose();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [showSheet, navigation, shouldNavigateBack]);

  // Optimized animation logic
  useEffect(() => {
    // Skip if no change
    if (visibleRef.current === isVisible) return;
    
    visibleRef.current = isVisible;
    
    // Prevent animation conflicts
    if (animatingRef.current) {
      animation.stopAnimation();
    }
    
    animatingRef.current = true;
    
    if (isVisible) {
      // Make sure component is rendered first
      setShowSheet(true);
      
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          animatingRef.current = false;
        });
      });
    } else {
      Animated.timing(animation, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        animatingRef.current = false;
        setShowSheet(false);
      });
    }
  }, [isVisible]);

  if (!showSheet) return null;

  return (
    <View style={[styles.container, StyleSheet.absoluteFill]}>
      <TouchableOpacity 
        style={[styles.backdrop, { backgroundColor: theme.backdropColor }]} 
        activeOpacity={1} 
      />
      <Animated.View 
        style={[
          styles.bottomSheet,
          { 
            backgroundColor: theme.background,
            transform: [{ translateY: animation }] 
          }
        ]}
      >
        <View style={[styles.handle, { backgroundColor: theme.handleColor }]} />
        
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: theme.accentBackground }]}>
          <Ionicons name="warning-outline" size={40} color={theme.accentColor} />
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>
          Activate Your Wallet
          </Text>
          
          <Text style={[styles.description, { color: theme.secondaryText }]}>
          Your Stellar wallet isn’t activated yet.
          Activate it now to start using all the features seamlessly!
          </Text>
          
          <TouchableOpacity 
            style={styles.activateButton}
            onPress={onActivate}
          >
            <Text style={styles.buttonText}>Claim 5 XLM Now!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleClose}
          >
            <Text style={[styles.cancelText, { color: theme.secondaryText }]}>
              Remind Me Later
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  activateButton: {
    backgroundColor: '#4F8EF7',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    fontSize: 14,
  },
});

export default WalletActivationComponent;