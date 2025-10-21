import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Animated, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const QRScannerComponent = ({ setModalVisible }) => {
  const [scanLineAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 240],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Scan QR Code</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.scannerContainer}>
        <Text style={styles.instructionText}>
          Position the QR code within the frame
        </Text>

        {/* Overlay with transparent center */}
        <View style={styles.overlayContainer}>
          {/* Top overlay */}
          <View style={styles.overlayTop} />
          
          {/* Middle row with left, center (transparent), right */}
          <View style={styles.overlayMiddle}>
            <View style={styles.overlayLeft} />
            
            {/* Transparent scanning area with corners */}
            <View style={styles.qrFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineTranslateY }],
                  },
                ]}
              />
            </View>
            
            <View style={styles.overlayRight} />
          </View>
          
          {/* Bottom overlay */}
          <View style={styles.overlayBottom} />
        </View>

        <Text style={styles.helperText}>
          Align QR code to scan automatically
        </Text>
      </View>

      {/* <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.galleryButton}>
          <Icon name="image" size={24} color="#fff" />
          <Text style={styles.galleryText}>Scan from Gallery</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
    zIndex: 10,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    width: '100%',
  },
  overlayLeft: {
    flex: 1,
    height: 280,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayRight: {
    flex: 1,
    height: 280,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  qrFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#2164C1',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    width: 240,
    height: 3,
    backgroundColor: '#2164C1',
    shadowColor: '#2164C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
    marginTop: 340,
    textAlign: 'center',
    zIndex: 10,
  },
  bottomContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  galleryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default QRScannerComponent;