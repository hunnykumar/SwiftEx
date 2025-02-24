import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const InfoCustomAlert = ({heading,subHeading,btnText,onclose}) => {
    return (
        <View style={styles.main}>
            <View style={styles.modalContiner}>
                <Text style={styles.modalContinerHeading}>{heading}</Text>
                    <Text style={styles.modalContinerHeading.modalContinerSubHeading}>{subHeading}</Text>
                    <TouchableOpacity style={styles.submitBtn} onPress={onclose}>
                    <Text style={styles.modalContinerHeading.modalContinerSubHeading}>{btnText}</Text>
                    </TouchableOpacity>
            </View>
        </View>
    )
}
export default InfoCustomAlert;
const styles = StyleSheet.create({
    main: {
        backgroundColor: "rgba(0,0,0,0.2)",
        position: "absolute",
        zIndex: 10,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        alignSelf:"center",
        padding: 5,
    },
    modalContiner: {
        backgroundColor: "#2A3D57",
        width: "95%",
        height: 250,
        borderRadius: 27,
        alignItems:"center",
        justifyContent:"space-around"
    },
    modalContinerHeading: {
        top: 25,
        fontSize:19,
        color:"#fff",
        alignSelf:"center",
        modalContinerSubHeading: {
            textAlign:"center",
            width: 332,
            height: 75,
            top: 13,
            alignSelf:"center",
            fontSize:16,
            color:"#fff"
        }
    },
    submitBtn: {
        width: 321,
        height: 48,
        borderRadius: 80,
        backgroundColor:"#2164C1"
    }
})