import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useEffect, useRef } from 'react';

const InfoComponent = ({
  visible = false,
  type = 'success',
  message = '',
  duration = 4000,
  onClose = () => {},
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const slideHorizontal = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow horizontal movement
        slideHorizontal.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = windowWidth * 0.3; // 30% of screen width

        if (Math.abs(gestureState.dx) > swipeThreshold) {
          // Swipe completed - animate off screen
          Animated.timing(slideHorizontal, {
            toValue: gestureState.dx > 0 ? windowWidth : -windowWidth,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            handleClose();
          });
        } else {
          // Swipe not completed - return to center
          Animated.spring(slideHorizontal, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      slideHorizontal.setValue(0); // Reset horizontal position
      // Slide in animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          background: '#FEE2E2',
          text: '#DC2626',
          border: '#FCA5A5',
        };
      case 'success':
        return {
          background: '#53a653',
          text: '#fff',
          border: '#fff',
        };
      case 'warning':
        return {
          background: '#FEF3C7',
          text: '#D97706',
          border: '#FCD34D',
        };
      default:
        return {
          background: '#DCFCE7',
          text: '#16A34A',
          border: '#86EFAC',
        };
    }
  };

  const colors = getColors();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY: slideAnim },
              { translateX: slideHorizontal },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.text }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 16,
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InfoComponent;