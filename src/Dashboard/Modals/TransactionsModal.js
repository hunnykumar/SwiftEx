import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  View,
  Button,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { urls } from "../constants";

const TransactionsModal = ({ modalVisible, setModalVisible, props }) => {
  const [transactions, setTransactions] = useState("");
  const state = useSelector((state) => state);

  const getTransactions = async () => {
    const token = await state.token;
    const user = await state.user;

    try {
      let response = await fetch(
        `http://${urls.testUrl}/user/getTransactions`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            emailId: user,
          }),
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson.responseData);
          setTransactions(responseJson.responseData.reverse());
        })
        .catch((error) => {
          alert(error);
        });
    } catch (e) {
      console.log(e);
      alert(e);
    }
  };

  useEffect(async () => {
    await getTransactions();
  }, []);

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => {
          // this.closeButtonFunction()
        }}
      >
        <View
          style={{
            height: "80%",
            marginTop: "auto",
            marginBottom: 50,
            backgroundColor: "#ddd",
            borderRadius: 20,
          }}
        >
          <View style={styles.footer}>
            <Text style={styles.headerText}>Transactions</Text>
            <View elevation={5} style={{ height: hp(60) }}>
              <ScrollView alwaysBounceVertical={true}>
                {transactions ? (
                  transactions.map((item) => {
                    const hash = item.hash;
                    return (
                      <TouchableOpacity
                        key={item.hash}
                        onPress={() => {
                          props.navigation.navigate("TxDetail", { hash });
                          setModalVisible(!modalVisible);
                        }}
                      >
                        <View
                          style={{
                            marginTop: 10,
                            borderColor: "black",
                            borderWidth: 2,
                            width: wp(99),
                            margin: 2,
                          }}
                        >
                          <Text>Type:</Text>
                          <Text>{item.type}</Text>
                          <Text>Hash:</Text>
                          <Text>{item.hash}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text>Nothing to show here</Text>
                )}
              </ScrollView>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <Text style={styles.addButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsModal;

const styles = StyleSheet.create({
  Amount: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: hp("3"),
    padding: 26,
  },
  noteHeader: {
    backgroundColor: "#42f5aa",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  footer: {
    flex: 1,
    backgroundColor: "#ddd",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("95"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("5"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  textInput2: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp("40"),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: hp("7"),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },

  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 30,
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
