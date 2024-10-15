import AsyncStorageLib from "@react-native-async-storage/async-storage"
import { Text, View, } from "native-base"
import { useEffect, useState } from "react"
import { Switch } from "react-native-paper"
import { heightPercentageToDP } from "react-native-responsive-screen"
import { getBiometrics, turnOffBiometrics } from "../biometrics/biometric"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StyleSheet,TouchableOpacity,Image } from "react-native"
import Icon from "../icon";
import darkBlue from "../../assets/Dark-Blue.png";
import { useSelector } from "react-redux"
export default function BiometricPage()
{
    const state=useSelector((state)=>state);
    const [Checked, setCheckBox] = useState(false)
    const navigation=useNavigation();
    function checkBiometric(Checked){
      if(!Checked){
        getBiometrics()
        }
        else{
          turnOffBiometrics()
        }
    }

  useEffect(()=>{
    AsyncStorageLib.getItem('Biometric')
    .then((response)=>{
      console.log(response)
      if(response==='SET'){
        setCheckBox(true)
      }
    })
  },[])

  

    return(
        <View style={{backgroundColor:state.THEME.THEME===false?"#fff":"black", height:heightPercentageToDP(100)}}>
<View style={[styles.header,{backgroundColor:state.THEME.THEME===false?"#4CA6EA":"black"}]}>
    <TouchableOpacity style={styles.backButton} onPress={()=>{navigation.goBack()}}>
    <Icon name={"left"} type={"antDesign"} size={29} color={"white"}/>
    </TouchableOpacity>
    {Platform.OS==='android'?<Text style={[styles.headerText_android,]}>{"Authentication"}</Text>:<Text style={styles.headerText}>{"Authentication"}</Text>}
    <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
    <Image source={darkBlue} style={styles.headerImage} />
    </TouchableOpacity>
  </View>  

            <View style={{  display:'flex', flexDirection:'row', justifyContent:'space-evenly', marginTop:50}}>
             <View>
            {/* <Text style={{fontSize:17}}>Enable Biometric Authentication</Text> */}
    {Platform.OS==='ios'?<Text style={{fontSize:17,color:state.THEME.THEME===false?"black":"#fff"}}>Enable Face ID Authentication</Text>:<Text style={{fontSize:17,color:state.THEME.THEME===false?"black":"#fff"}}>Enable Biometric Authentication</Text>}
            </View>   
            <Switch
              value={Checked}
              onValueChange={() => {
                setCheckBox(!Checked)
                checkBiometric(Checked)
            }}
            />
          </View>
        </View>
    )
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4CA6EA',
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor:"gray",
    borderWidth:0.5
  },
  backButton: {
    paddingHorizontal: 10,
  },
  headerText_android:{
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:3,
    paddingLeft:45
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:19,
    paddingLeft:53
  },
  headerImage: {
    width: 80,
    height: 60,
    borderRadius: 20,
    marginRight: 3,
  }
  });