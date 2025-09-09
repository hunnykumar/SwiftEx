import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const ExchangeDetailsSubmittion = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Country codes array - you can expand this
  const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+971', country: 'UAE' },
    { code: '+60', country: 'Malaysia' },
    { code: '+65', country: 'Singapore' }
  ];

  // Validation functions
  const validateFirstName = (name) => {
    if (!name.trim()) return 'First name is required';
    if (name.trim().length < 2) return 'First name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'First name should only contain letters';
    return null;
  };

  const validateLastName = (name) => {
    if (!name.trim()) return 'Last name is required';
    if (name.trim().length < 2) return 'Last name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Last name should only contain letters';
    return null;
  };

  const validateCountryCode = (code) => {
    if (!code.trim()) return 'Country code is required';
    if (!code.startsWith('+')) return 'Country code must start with +';
    if (!/^\+\d{1,4}$/.test(code)) return 'Invalid country code format';
    return null;
  };

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^\d{7,15}$/.test(phone.trim())) return 'Phone number must be 7-15 digits';
    return null;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};

    const firstNameError = validateFirstName(formData.firstName);
    const lastNameError = validateLastName(formData.lastName);
    const countryCodeError = validateCountryCode(formData.countryCode);
    const phoneNumberError = validatePhoneNumber(formData.phoneNumber);

    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (countryCodeError) newErrors.countryCode = countryCodeError;
    if (phoneNumberError) newErrors.phoneNumber = phoneNumberError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateAllFields()) {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        countryCode: formData.countryCode.trim(),
        phoneNumber: formData.phoneNumber.trim()
      };

      console.log('Submitting user data:', submitData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show success message
      Alert.alert(
        'Success!',
        'Profile information has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.log('Error submitting form:', error);
      Alert.alert('Error', 'Failed to save profile information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup',
      'You can complete your profile later from settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'default',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Select country code
  const selectCountryCode = (code) => {
    handleInputChange('countryCode', code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#011434" barStyle="light-content" />
      
      {/* Header with Skip button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Complete Profile</Text>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            
            {/* Form Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Personal Information</Text>
              <Text style={styles.subtitle}>
                Please fill in your details to complete your profile
              </Text>
            </View>

            {/* First Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                First Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                placeholderTextColor="#666"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Last Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                placeholderTextColor="#666"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Country Code Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Country Code <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.countryCode && styles.inputError]}
                placeholder="e.g. +91"
                placeholderTextColor="#666"
                value={formData.countryCode}
                onChangeText={(value) => handleInputChange('countryCode', value)}
                keyboardType="phone-pad"
                maxLength={5}
              />
              {errors.countryCode && (
                <Text style={styles.errorText}>{errors.countryCode}</Text>
              )}
              
              {/* Country Code Suggestions */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.codeScrollView}
              >
                {countryCodes.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.codeChip,
                      formData.countryCode === item.code && styles.selectedCodeChip
                    ]}
                    onPress={() => selectCountryCode(item.code)}
                  >
                    <Text style={[
                      styles.codeChipText,
                      formData.countryCode === item.code && styles.selectedCodeChipText
                    ]}>
                      {item.code} ({item.country})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, errors.phoneNumber && styles.inputError]}
                placeholder="Enter phone number without country code"
                placeholderTextColor="#666"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                maxLength={15}
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
              {formData.countryCode && formData.phoneNumber && (
                <Text style={styles.fullNumberText}>
                  Full Number: {formData.countryCode} {formData.phoneNumber}
                </Text>
              )}
            </View>

          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011434',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(72, 93, 202, 0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#659DEA',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: wp(5),
    paddingBottom: hp(3),
  },
  titleContainer: {
    marginBottom: hp(4),
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: 16,
    color: '#CBBBDC',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: hp(3),
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: hp(1),
  },
  required: {
    color: '#E96A6A',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(72, 93, 202, 0.5)',
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    fontSize: 16,
    color: '#fff',
    minHeight: hp(6),
  },
  inputError: {
    borderColor: '#E96A6A',
    backgroundColor: 'rgba(233, 106, 106, 0.1)',
  },
  errorText: {
    color: '#E96A6A',
    fontSize: 14,
    marginTop: hp(0.5),
    marginLeft: wp(2),
  },
  codeScrollView: {
    marginTop: hp(1),
  },
  codeChip: {
    backgroundColor: 'rgba(72, 93, 202, 0.3)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    borderRadius: 20,
    marginRight: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(72, 93, 202, 0.5)',
  },
  selectedCodeChip: {
    backgroundColor: '#659DEA',
    borderColor: '#659DEA',
  },
  codeChipText: {
    color: '#CBBBDC',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCodeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  fullNumberText: {
    color: '#35CA1D',
    fontSize: 14,
    marginTop: hp(0.5),
    marginLeft: wp(2),
    fontWeight: '500',
  },
  buttonContainer: {
    padding: wp(5),
    paddingTop: hp(2),
  },
  submitButton: {
    backgroundColor: '#659DEA',
    paddingVertical: hp(2),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#659DEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#4A5568',
    elevation: 0,
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ExchangeDetailsSubmittion;