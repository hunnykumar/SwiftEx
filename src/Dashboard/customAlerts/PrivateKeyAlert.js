import { useState} from 'react'
import { StyleSheet, Text, ActivityIndicator, KeyboardAvoidingView,View, Button, Modal, FlatList, TouchableOpacity, Alert } from 'react-native';
import Dialog from "react-native-dialog";
import AlertInput from 'react-native-alert-input';


 const PrivateKeyAlert = ()=>{
    //const[visible, setVisible]= useState(true)
   // const[privateKey, setPrivateKey]= useState('')
    
return (
    
    <DialogInput 
                isDialogVisible={visible2}
                title={"Feedback"}
                message={"Message for Feedback"}
                hintInput ={"Enter Text"}
                submitInput={ (inputText) => {
                    console.log(inputText),
                    setVisible(false);
                }}
                closeDialog={() => setVisible2(false)}>
            </DialogInput>

)

}
export default PrivateKeyAlert