import React, { useEffect } from "react";
import {
  Button,
  Modal,
  VStack,
  HStack,
  Text,
  Radio,
  Center,
  NativeBaseProvider,
  FormControl,
  Input,
  View,
} from "native-base";
import { useState } from "react";
import { FaucetDropdown } from "../reusables/faucetDropdown";
import { Linking, TouchableOpacity } from "react-native";
import { faucets } from "../constants";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SendNotification } from "../notifications/pushController";
import { useSelector } from "react-redux";

export const FaucetModal = ({ showModal, setShowModal }) => {
  const [network, setNetwork] = useState("");
  const [url,setUrl] = useState('')

  useEffect(()=>{
 //setShowModal(false);
 
if (network === "BSC") {
  setUrl(faucets.bscFaucet)
} else if (network === "Ethereum") {
  setUrl(faucets.ethFaucetGoerli)
} else if(network==='Matic') {
  setUrl(faucets.polygonFaucet)
}else{
  setUrl(' ')
}
  },[network])
  const state=useSelector((state)=>state)
  return (
    <Center>
      <TouchableOpacity
      style={{backgroundColor: state.THEME.THEME===false?"#fff":"black",borderRadius:16,marginLeft:0,padding:'6%'}}
        // onPress={ () => {
          // setShowModal(true)
         // console.log('pressed')
       //SendNotification('title','test')
        // }}
      >
        <Text style={{color:state.THEME.THEME===false?"white":"black",fontWeight: "bold"}}>Add Test Faucet Balance</Text>
      </TouchableOpacity>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.CloseButton />
          <Modal.Header>Select Faucet Network</Modal.Header>
          <Modal.Body>
            <FaucetDropdown network={network} setNetwork={setNetwork} />
            <View style={{display:'flex',alignContent:'center',alignItems:'center',marginTop:10}}>
              <Text selectable={true} style={{textAlign:'center'}}>{url?url:'please select a network'}</Text>
            </View>
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  setShowModal(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onPress={() => {
                  //setShowModal(false);
                  if (!network) {
                    setShowModal(false);

                    return alert("please select a network to proceed");
                  }
                  if (network === "BSC") {
                    setShowModal(false);

                    Linking.openURL(faucets.bscFaucet);
                  } else if (network === "Ethereum") {
                    setShowModal(false);

                    Linking.openURL(faucets.ethFaucetGoerli);
                  } else {
                    setShowModal(false);

                    Linking.openURL(faucets.polygonFaucet);
                  }
                }}
              >
                open
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Center>
  );
};
