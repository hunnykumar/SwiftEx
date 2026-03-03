import { useSelector } from "react-redux";
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
import StellarTransactionHistory from "./StellarTransactionHistory";
import { useNavigation } from "@react-navigation/native";

export const TransactionView = () => {
  const state = useSelector((state) => state);
  const navigation=useNavigation();
  return (
    <>
    <Exchange_screen_header title="Transactions" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
    <StellarTransactionHistory publicKey={state.STELLAR_PUBLICK_KEY} isDarkMode={state.THEME.THEME}/>
    </>
  );
};
