import { Button, Linking, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { authRequest, GET, POST } from "../api";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { DataTable } from "react-native-paper";
import { NewAccountModal } from '../components/newAccount.model'

const ExternalAccountsListView = ({ externalAccounts }) => {
  return (
    <>
      <Text>External Accounts</Text>
      <DataTable style={styles.container}>
        <DataTable.Header style={styles.tableHeader}>
          <DataTable.Title style={{ fontWeight: 600 }}>
            Bank Name
          </DataTable.Title>
          <DataTable.Title style={{ fontWeight: 600 }}>
            Bank Holder Name
          </DataTable.Title>
          <DataTable.Title style={{ fontWeight: 600 }}>
            Payout Metods
          </DataTable.Title>
          <DataTable.Title style={{ fontWeight: 600 }}>Country</DataTable.Title>
          <DataTable.Title style={{ fontWeight: 600 }}>
            Currency
          </DataTable.Title>
        </DataTable.Header>
        {externalAccounts? (
          <>
            {externalAccounts.map((account) => {
              console.log(account.bank_name)
              return (
                <DataTable.Row style={styles.rowHeader} key={account.id}>
                <DataTable.Cell >{account.bank_name}</DataTable.Cell>
                <DataTable.Cell>{account.account_holder_name}</DataTable.Cell>
                <DataTable.Cell>
                  {account.available_payout_methods[0]}
                </DataTable.Cell>
                <DataTable.Cell>{account.country}</DataTable.Cell>
                <DataTable.Cell>{account.currency}</DataTable.Cell>
              </DataTable.Row>
            
            )
            }
            )
            }
          </>
        ) : (
          <DataTable.Row>
            <DataTable.Cell>No accounts here</DataTable.Cell>
          </DataTable.Row>
        )}
      </DataTable>
    </>
  );
};

export const AccountView = (props) => {
  const [message, setMessage] = useState();
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    getAccountDetails();
  }, []);

  const getAccountDetails = async () => {
    try {
      const { res, err } = await authRequest("/users/getStripeAccount", GET);
      if (err) return setMessage(` ${err.message}`);
      setAccount(res);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  

  const createAccount = async () => {
    try {
      setIsCreatingAccount(true);
      const { res, err } = await authRequest(
        "/users/createStripeAccount",
        POST
      );
      if (err) return setMessage(`${err.status}: ${err.message}`);
      setConnectLink(res.connectLink);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text>My Account</Text>
        <Text>{message}</Text>

        <View>
          {isLoading ? (
            <Text>Loading...</Text>
          ) : (
            <>
              {account ? (
                
                <View>
                    <>
                      <View>
                        <Text>Charges Enabled:</Text>
                        <Text>{account.charges_enabled ? "Yes" : "No"}</Text>
                        <Text>Payouts Enabled:</Text>
                        <Text>{account.payouts_enabled ? "Yes" : "No"}</Text>
                      </View>
                      <ExternalAccountsListView
                        externalAccounts={account.external_accounts.data}
                      />
                    </>
                 
                </View>
              ) : (
                <View>
               <Text>
                Please add an account first
               </Text>
               <NewAccountModal getAccountDetails={getAccountDetails}/>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    width: wp(100),
    padding: 10,
    height: hp(100),
    backgroundColor:'white'

  },
  scrollView: {
    width: wp(90),
  },
  tableHeader: {
    backgroundColor: "grey",
    width:wp(100),
    height:hp(8),
  },
  rowHeader: {
    backgroundColor: "blue",
    width:wp(100),
    height:hp(8)
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  content: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    height: hp(100),
  },
});
/*
loading={isCreatingAccount}
                        onClick={createAccount}
                        variant="outlined"
*/
