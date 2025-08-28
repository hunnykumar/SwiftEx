import ImportStellarModal from "./importStellarModal";

export default function SELECT_WALLET_EXC  ({ visible, setVisible, setModalVisible }){
  return(
    <ImportStellarModal
    Visible={visible}
    onCrossPress={setModalVisible}
    setWalletVisible={setModalVisible}
    setModalVisible={setVisible}
    setVisible={setVisible}
  />
  )
};
