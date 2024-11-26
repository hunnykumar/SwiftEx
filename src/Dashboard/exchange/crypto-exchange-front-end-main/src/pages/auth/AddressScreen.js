import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { Exchange_Login_screen } from '../../../../../reusables/ExchangeHeader';
import { useNavigation } from '@react-navigation/native';
import { getAuth, getToken } from '../../api';
import { REACT_APP_HOST } from '../../ExchangeConstants';
import { alert } from '../../../../../reusables/Toasts';

const AddressScreen = () => {
  const navigation=useNavigation()
  const [formData, setFormData] = useState({
    line1: '',
    postal_code: '',
    city: '',
    state: '',
    country: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const { line1, postal_code, city, state, country } = formData;

    if (!line1 || !postal_code || !city || !state || !country) {
      return false;
    }

    return true;
  };

  const handleAddAddress =async () => {
    Keyboard.dismiss()
    if (validateForm()) {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer "+await getToken());
      
      const raw = JSON.stringify(formData, null, 2);
      
      const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      
      fetch(REACT_APP_HOST+"/users/updateAddress", requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log("67890-----=-=",result)
          if(result.statusCode===200&&result.message===true)
          {
            alert("success","Added Address successfully.")
            navigation.goBack()
          }
          if(result.statusCode===404)
          {
            alert("error",result.message)
          }
          if(result.statusCode===500)
          {
            alert("error","Somthing went wrong.")
          }

        })
        .catch((error) => console.error(error));


    } else {
      Alert.alert('Validation Error', 'All fields are required. Please fill in all fields.');
    }
  };
  return (
    <View style={styles.container}>
    <Exchange_Login_screen title="" onLeftIconPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.label}>Address Line 1</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter address line 1"
          placeholderTextColor={"gray"}
          value={formData.line1}
          onChangeText={(value) => handleInputChange('line1', value)}
        />

        <Text style={styles.label}>Postal Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter postal code"
          placeholderTextColor={"gray"}
          value={formData.postal_code}
          onChangeText={(value) => handleInputChange('postal_code', value)}
          keyboardType="numeric"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city"
          placeholderTextColor={"gray"}
          value={formData.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter state"
          placeholderTextColor={"gray"}
          value={formData.state}
          onChangeText={(value) => handleInputChange('state', value)}
        />

        <Text style={styles.label}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter country"
          placeholderTextColor={"gray"}
          value={formData.country}
          onChangeText={(value) => handleInputChange('country', value)}
        />
      </ScrollView>

      <TouchableOpacity style={styles.buttonContainer} onPress={handleAddAddress}>
        <Text style={styles.buttonText}>Add Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131E3A',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color:"#fff"
  },
  buttonText:{
    color:"#fff",
    fontSize:21,
    fontWeight:"600"
  },
  buttonContainer: {
    alignSelf:"center",
    width:"90%",
    marginBottom: 40,
    paddingHorizontal: 16,
    paddingVertical:13,
    borderRadius:50,
    alignItems:"center",
    justifyContent:"center",
    backgroundColor: "rgba(47, 125, 255, 1)rgba(0, 77, 206, 1)",
  },
});

export default AddressScreen;
