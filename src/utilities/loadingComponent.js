import { View, Text } from "react-native"
import { ActivityIndicator } from "react-native-paper"

export const SwapLoadingComponent = () =>{
    return(
        <View style={{display:'flex', alignItems:'center' , alignContent:'center'}}>
            <ActivityIndicator size={'large'} color={'white'} />
            <Text style={{color:'white'}}>Swapping.Please wait!</Text>
        </View>
    )
}

export const SendLoadingComponent = () =>{
    return(
        <View style={{display:'flex', alignItems:'center' , alignContent:'center'}}>
            <ActivityIndicator size={'large'} color={'white'} />
            <Text style={{color:'white'}}>Sending.Please wait!</Text>
        </View>
    )
}