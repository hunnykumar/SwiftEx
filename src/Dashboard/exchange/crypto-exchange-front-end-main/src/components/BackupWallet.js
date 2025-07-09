import { Modal, View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert, } from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';

const BackupWallet = ({ open, close }) => {
  const state=useSelector((state)=>state);
  const [backupLoading,setbackupLoading]=useState(false);
  const [backupStatus,setbackupStatus]=useState(false);
  useEffect(()=>{
    setbackupLoading(false)
    setbackupStatus(false)
  },[])
  
  const backupNowExe = async (fileName) => {
    setbackupLoading(true)
    try {
      const filePath = `/storage/emulated/0/Download/${fileName}.txt`;
      const content = JSON.stringify({
        "Multi Coin Name":state.wallet.name,
        "Multi Coin Address":state.wallet.address,
        "Multi Coin Mnemonic":state.wallet.mnemonic,
        "Multi Coin Private Key":state.wallet.privateKey,
        "Multi Coin Stellar Public Key":state.STELLAR_PUBLICK_KEY,
        "Multi Coin Stellar Private Key":state.STELLAR_SECRET_KEY,
      }, null, 2);
      await RNFS.writeFile(filePath, content, 'utf8');
      setbackupLoading(false)
      setbackupStatus(true)
    } catch (err) {
      Alert.alert("info","Faild to backup file");
      setbackupLoading(false)
      setbackupStatus(false)
    }
  }

  return (
    <Modal transparent animationType="slide" visible={open} onRequestClose={close}>
      <View style={styles.container}>
        <View style={[styles.subContainer,{backgroundColor:state.THEME.THEME===false?"#fff":"#18181C",height:backupStatus?"30%":"35%"}]}>
            <Ionicons name="close-circle-outline" size={35} color={state.THEME.THEME===false?"#080a0a":"#fff"} style={{alignSelf:"flex-end"}} onPress={()=>{ setbackupLoading(false),setbackupStatus(false),close()}} disabled={backupLoading}/>
            <Ionicons name={backupStatus?"cloud-done-sharp":"shield-half-sharp"} size={89} color={"#4F8EF7"} style={{alignSelf:"center",marginVertical:"5%"}}/>
            <Text style={[styles.subHeading,{color:state.THEME.THEME===false?"#080a0a":"#fff"}]}>Back up your secret phrase to keep your keys safe and secure. Never share your keys with anyone.</Text>
           {backupStatus?<Text style={[styles.subHeading,{color:"#4F8EF7"}]}>Path: Internal storage/Download</Text>: <TouchableOpacity style={[styles.btnCon,{backgroundColor:backupLoading?state.THEME.THEME===false?"#fff":"#18181C":"green"}]} disabled={backupLoading} onPress={()=>{backupNowExe(state.wallet.name)}}>
              {backupLoading?<ActivityIndicator color={"green"} size={"large"}/>:<Text style={styles.btnText}>{"Start your backup now!"}</Text>}
            </TouchableOpacity>}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  subContainer:{
    borderTopLeftRadius:30,
    borderTopRightRadius:30,
    padding:10,
  },
  subHeading:{
    fontSize:17,
    fontWeight:"400",
    textAlign:"center"
  },
  btnCon:{
    width:"95%",
    height:50,
    padding:10,
    justifyContent:"center",
    alignSelf:"center",
    borderRadius:30,
    marginTop:"5%",
    marginBottom:"5%"
  },
  btnText:{
    textAlign:"center",
    fontSize:18,
    fontWeight:"500",
    color:"#fff"
  },
});
export default BackupWallet;