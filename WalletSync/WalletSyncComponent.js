import "@walletconnect/react-native-compat";
import "@ethersproject/shims";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RNCamera } from "react-native-camera";
import { Core } from "@walletconnect/core";
import { Web3Wallet } from "@walletconnect/web3wallet";
import { useSelector } from "react-redux";
import { WALLET_CONN_PROJECT_ID } from '@env';

const PROJECT_ID = WALLET_CONN_PROJECT_ID;

const WalletSyncComponent = () => {
  const cameraRef = useRef(null);
  const [wallet, setWallet] = useState(null);

  const [web3wallet, setWeb3wallet] = useState(null);
  const [manualUri, setManualUri] = useState("");
  const [scanned, setScanned] = useState(false);
  const [proposal, setProposal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
    const state = useSelector((state) => state);
  useEffect(() => {
    const init = async () => {
      try {
        setWallet(state.wallet.address);

        const core = new Core({ projectId: PROJECT_ID });
        const web3 = await Web3Wallet.init({
          core,
          metadata: {
            name: "ReactNative Web3Wallet",
            description: "Demo WalletConnect v2",
            url: "https://walletconnect.com",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
          storageOptions: { asyncStorage: AsyncStorage },
        });

        web3.on("session_proposal", async (proposal) => {
          setProposal(proposal);
          setModalVisible(true);
        });

        setWeb3wallet(web3);
        console.log("Web3Wallet Initialized");
      } catch (err) {
        console.log("Wallet Init Error:", err);
      }
    };

    init();
  }, []);

  const approveSession = async () => {
    try {
      await web3wallet.approveSession({
        id: proposal.id,
        namespaces: {
          eip155: {
            chains: ["eip155:1"],
            methods: ["eth_sendTransaction", "personal_sign"],
            events: ["accountsChanged", "chainChanged"],
            accounts: [`eip155:1:${wallet}`,`eip155:1:${state.STELLAR_PUBLICK_KEY}`],
          },
        },
      });
      setModalVisible(false);
      Alert.alert("Wallet Connected");
    } catch (err) {
      console.error("Session approval failed", err);
    }
  };

  const rejectSession = async () => {
    try {
      await web3wallet.rejectSession({
        id: proposal.id,
        reason: {
          code: 4001,
          message: "User rejected the connection request",
        },
      });
      setModalVisible(false);
    } catch (err) {
      console.error("Session rejection failed", err);
    }
  };

  const handlePairing = async (uri) => {
    try {
      if (!uri) throw new Error("Invalid WalletConnect URI");
      await web3wallet.core.pairing.pair({ uri });
      setScanned(true);
    } catch (err) {
      Alert.alert("Pairing error", err.message);
      console.error("Pairing error:", err);
    }
  };

  const handleBarCodeRead = async ({ data }) => {
    if (!scanned && data.startsWith("wc:")) {
      await handlePairing(data);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!scanned ? (
        <View style={{ flex: 1 }}>
          <RNCamera
            ref={cameraRef}
            style={{ flex: 1 }}
            onBarCodeRead={handleBarCodeRead}
            captureAudio={false}
          />
          <View style={{ padding: 10 }}>
            <Text style={{ color: "#000" }}>Or enter WalletConnect URI manually:</Text>
            <TextInput
              style={styles.input}
              placeholder="wc:..."
              value={manualUri}
              onChangeText={setManualUri}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button title="Connect" onPress={() => handlePairing(manualUri)} />
          </View>
        </View>
      ) : (
        <View style={styles.center}>
          <Text>Wallet Connected</Text>
          <Text style={{ marginTop: 10 }}>{wallet}</Text>
          <Button title="Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}

      {/* Modal for Session Approval */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Session Request</Text>
            {proposal?.params?.proposer && (
              <>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>DApp:</Text>{" "}
                  {proposal.params.proposer.metadata.name}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>URL:</Text>{" "}
                  {proposal.params.proposer.metadata.url}
                </Text>
              </>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.rejectBtn} onPress={rejectSession}>
                <Text style={{ color: "#fff" }}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={approveSession}>
                <Text style={{ color: "#fff" }}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WalletSyncComponent;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  approveBtn: {
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  rejectBtn: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
});
