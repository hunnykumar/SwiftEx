// import { useState, useMemo, useEffect } from 'react'
// import { authRequest, POST } from '../api'
// import { modalStyle } from './style.modal'
// import { COUNTRY_TO_ROUTING_NUMBER_ALIAS } from '../utils/constants'
// import { countries, currencies } from '@aerapass/country-data'
// import { PaperSelect } from 'react-native-paper-select';
// import Modal from "react-native-modal";
// import { TextInput } from 'react-native-paper'
// import { ActivityIndicator, Button, TouchableOpacity } from 'react-native'
// import {  Text, View , StyleSheet} from "react-native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import { Dropdown } from 'react-native-element-dropdown';
// import AntDesign from 'react-native-vector-icons/AntDesign';

// // <===============================< Constants >==============================>
//    /* const TEST_EXTERNAL_ACCOUNT_DATA = {
//       country: 'IN',
//       currency: 'INR',
//       account_number: '000123456789',
//       routing_number: 'HDFC0000261',
//     }*/

//     const TEST_EXTERNAL_ACCOUNTS_DATA = [
//       {
//         country: 'US',
//         currency: 'USD',
//         account_number: '000123456789',
//         routing_number: '110000000',
//       },
//       {
//         country: 'CA',
//         currency: 'CAD',
//         account_number: '000123456789',
//         routing_number: '11000-000',
//       },
//       {
//         country: 'FR',
//         currency: 'EUR',
//         account_number: 'FR1420041010050500013M02606',
//       },
//     ]

// // const COUNTRY_CURRENCY_LIST = allCoutries()
// const COUNTRY_LIST = countries.all
// const CURRENCY_LIST = currencies.all
// const ITEM_HEIGHT = 48
// const ITEM_PADDING_TOP = 8
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// }
// // <================================< Helpers >===============================>
//  const _getCountryOptions = () =>
//   COUNTRY_LIST.map(({ name, alpha2 }) => ({
//     value: alpha2,
//     label: name,
//   }))

// export const _getCurrencyOptions = () =>
//   CURRENCY_LIST.map(({ name, code }) => ({
//     value: code,
//     label: `${code} (${name})`,
//   }))

//   const _getExternalAccountTestData = () => {
//     const randomIndex = Math.floor(
//       Math.random() * TEST_EXTERNAL_ACCOUNTS_DATA.length
//     )
//     return TEST_EXTERNAL_ACCOUNTS_DATA[randomIndex]
//   }

// // <=============================< View Functions >===========================>
// export const SelectView = ({ options, onChange, value, name, inputLabel, selected }) => {
//   const [isFocus, setIsFocus] = useState(false);

//   return (
//     <View style={styles.container}>

//     <Dropdown
//     style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
//     placeholderStyle={styles.placeholderStyle}
//     selectedTextStyle={styles.selectedTextStyle}
//     inputSearchStyle={styles.inputSearchStyle}
//     iconStyle={styles.iconStyle}
//     data={options}
//     search
//     autoScroll={false}
//     maxHeight={600}
//     labelField="label"
//     valueField="value"
//     placeholder={inputLabel}
//     searchPlaceholder="Search..."
//     value={value}
//     onFocus={() => setIsFocus(true)}
//     onBlur={() => setIsFocus(false)}
//     onChange={(input)=>{
//       const event ={
//         name:inputLabel,
//         value:input.value,
//         label:input.label
//       }
//       console.log(event)
//       onChange(event)
//     }}

//     renderLeftIcon={() => (
//       <AntDesign
//         style={styles.icon}
//         color={isFocus ? 'blue' : 'white'}
//         name="Safety"
//         size={20}
//       />
//     )}
//   />
// </View>
//   )
// }

// export const NewAccountModal = ({getAccountDetails}) => {
//   const [modalMessage, setModalMessage] = useState('')
//   const [isCreatingAccount, setIsCreatingAccount] = useState(false)
//   const [isIban, setIsIban] = useState(false)
//   const [open, setOpen] = useState(false)
//   const[loading,setLoading] = useState(false)
//   const [routingNumberAlias, setRoutingNumberAliasLabel] = useState(
//     COUNTRY_TO_ROUTING_NUMBER_ALIAS.US
//   )
//   const countryOptions = useMemo(() => _getCountryOptions(), [])
//   const currencyOptions = useMemo(() => _getCurrencyOptions(), [])
//   const [selected,setSelected] = useState([])
//   const [newAccount, setNewAccount] = useState({
//     country: '',
//     currency: '',
//     account_number: '',
//     routing_number: '',
//   })

//   const handleOpen = () => {
//     setOpen(true)
//   }
//   const handleClose = () => {
//     setNewAccount({
//       country: '',
//       currency: '',
//       account_number: '',
//       routing_number: '',
//     })
//     setOpen(false)
//   }

//   const handleChange = (event) => {
//     const name = event.name
//     const value = event.value
//     const newState = { ...newAccount }
//     console.log(name,value)
//     // Change routing number alias to specific country
//     // And preset the default currency for the country
//     if (name === 'Country') {
//       setRoutingNumberAliasLabel(
//         COUNTRY_TO_ROUTING_NUMBER_ALIAS[value] ||
//           COUNTRY_TO_ROUTING_NUMBER_ALIAS.US
//       )

//       if (COUNTRY_TO_ROUTING_NUMBER_ALIAS[value] === 'IBAN') {
//         setIsIban(true)
//       } else {
//         setIsIban(false)
//       }

//       console.log(
//         'routing number alias: ',
//         COUNTRY_TO_ROUTING_NUMBER_ALIAS[value]
//       )
//       newState.currency = countries[value].currencies[0] || ''
//     }

//     newState[name] = value
//     setNewAccount(newState)
//   }

//   const handleSubmit = async () => {
//     try {
//       // Validation
//       setLoading(true)
//       const { country, account_number, currency, routing_number } = newAccount
//       if (
//         !country ||
//         !account_number ||
//         !currency ||
//         (!isIban && !routing_number)
//       )
//         return setModalMessage('All fields are required')

//         const reqBody = { ...newAccount }
//       if (isIban) delete reqBody.routing_number

//       setIsCreatingAccount(true)
//       const { res, err } = await authRequest(
//         '/users/createStripeAccount',
//         POST,
//         reqBody
//       )
//       if (err) return setModalMessage(`${err.status}: ${err.message}`)
//       handleClose()
//       setLoading(false)
//       alert('Account Added Successfully')
//       getAccountDetails()
//       return setModalMessage(res.data.message || 'Account added successfully')
//     } catch (err) {
//       console.log(err)
//       setLoading(false)
//       setModalMessage(err.message || 'Something went wrong')
//     } finally {
//       setIsCreatingAccount(false)
//       setLoading(false)
//       getAccountDetails()
//       setNewAccount({
//         country: '',
//         currency: '',
//         account_number: '',
//         routing_number: '',
//       })
//     }
//     setModalMessage('')
//   }

//   const prefill = () => {
//    // setIsIban(false)
//     //setNewAccount({ ...TEST_EXTERNAL_ACCOUNT_DATA })
//     const testData = _getExternalAccountTestData()
//      setIsIban(!testData.routing_number)
//      setNewAccount({ ...testData })
//   }

//   useEffect(()=>{
//    // console.log(countryOptions)
//   },[])

//   return (
//     <>
//       <Button title='Add an account' onPress={handleOpen} color={'green'} >Add Your Bank Account</Button>
//       <Modal
//       animationIn="slideInRight"
//       animationOut="slideOutRight"
//       animationInTiming={100}
//       animationOutTiming={200}
//       isVisible={open}
//       onBackdropPress={() => {
//         handleClose()
//       }}
//       onBackButtonPress={() => {
//         //setShowModal(!showModal);
//         handleClose()
//       }}
//       >
//         <View style={{height:hp(90), backgroundColor:'white'}}>
//           <Text>Enter Your Bank Account Details</Text>
//           <Text>{modalMessage}</Text>
//           {/* NOTE: bellow element is only for test and has to be removed in prod */}
//           <View>
//             <Text>{`[ONLY FOR TEST] `}</Text>
//             <TouchableOpacity onPress={()=>{
//                 prefill()
//             }}>

//             <Text>
//               click here
//             </Text>
//             <Text style={{color:'blue'}}>{' '}
//            prefill with a test bank account</Text>
//             </TouchableOpacity>
//           </View>
//           <View>
//             <View>

//           <SelectView
//             options={countryOptions}
//             value={newAccount.country}

//             onChange={handleChange}
//             name='country'
//             inputLabel='Country'
//             selected={selected}
//             ></SelectView>
//             </View>
//             <View>
//           <SelectView
//             options={currencyOptions}
//             value={newAccount.currency}
//             onChange={handleChange}
//             name='currency'
//             inputLabel='Currency'
//             selected={selected}
//             ></SelectView>
//             </View>
//           <TextInput
//             style={{marginTop:hp(5)}}
//             id='outlined-basic'
//             label={isIban ? 'IBAN' : 'Acccount Number'}
//             value={newAccount.account_number}
//             variant='outlined'
//             margin='normal'
//             //onChange={handleChange}
//             name='account_number'
//             onChangeText={(text)=>{
//               let data ={
//                 value:text,
//                 name:'account_number'
//               }
//               handleChange(data)
//             }}
//             />
//           {!isIban && (
//             <TextInput
//             style={{marginTop:hp(5)}}
//             id='outlined-basic'
//             label={routingNumberAlias}
//             value={newAccount.routing_number}
//             variant='outlined'
//             margin='normal'
//             onChange={handleChange}
//             onChangeText={(text)=>{
//               let data ={
//                 value:text,
//                 name:'routing_number'
//               }
//               handleChange(data)
//             }}
//             name='routing_number'
//             />
//             )}
//             </View>
//           <View
//           style={{marginTop:hp(5)}}
//           >
//             {loading?<ActivityIndicator color={'blue'} size={'large'}/>:<View></View>}
//             <Button
//               title='Submit'
//               onPress={handleSubmit}
//               color={'green'}
//             >
//               Submit
//             </Button>
//           </View>
//         </View>
//       </Modal>
//     </>
//   )
// }

// const styles=StyleSheet.create({
//   text:{
// bottom:wp('35'),
// color:'white'
//   },
//   textDesign:{
// color:'white',
// fontStyle:'italic',
// fontWeight:'bold',
// marginLeft:wp('3')
//   },
//   textDesign2:{
//     color:'white',
//     fontWeight:'bold',
//     marginLeft:wp('5')
//       },
//       textDesign3:{
//         color:'white',
//         fontWeight:'bold',
//         marginLeft:wp('2')
//           },
//           textDesign4:{
//             color:'white',
//             fontWeight:'bold',
//             marginLeft:wp('4')
//               },
//   buttons:{
//     display:'flex',
//     flexDirection:'row',
//     justifyContent:'space-evenly',
//     bottom:hp('16')
//   },
//   addButton: {
//     display:'flex',
//     paddingLeft:wp('4'),
//     opacity:0.8,
//     alignItems:'center',
//     textAlign:'center',
//     zIndex: 11,
//     backgroundColor: 'grey',
//     width: wp('15'),
//     height: hp('6'),
//     borderRadius: 45,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//   },
//   addButton2: {
//     position: 'absolute',
//     zIndex: 11,
//     left: 20,
//     bottom: 90,
//     backgroundColor: 'green',
//     width: 80,
//     height: 70,
//     borderRadius: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//   },
//   addButtonText: {
//     color: '#fff',
//     fontSize: 18,
//   },
//   container: {
//     backgroundColor: 'white',
//     color:'black'
//   },
//   dropdown: {
//     height: hp('7'),
//     width:wp('90'),
//     borderColor: 'gray',
//     borderWidth: 0.5,
//     borderRadius: 8,
//     paddingHorizontal: 8,
//     marginTop:hp('5'),
//   },
//   icon: {
//     marginRight: 5,
//     backgroundColor:'blue'
//   },
//   label: {
//     position: 'absolute',
//     backgroundColor: 'white',
//     left: wp('13'),
//     zIndex: -999,
//     paddingHorizontal: 8,
//     fontSize: 14,
//     color:'black',
//     height:hp('3'),
//     bottom:hp('8')
//   },
//   placeholderStyle: {
//     fontSize: 16,
//     color:'black'
//   },
//   selectedTextStyle: {
//     fontSize: 11,
//     color:'black'
//   },
//   iconStyle: {
//     width: 20,
//     height: 20,
//     backgroundColor:'blue'
//   },
//   inputSearchStyle: {
//     height: 40,
//     fontSize: 16,
//   },
//   label: {
//     position: 'absolute',
//     backgroundColor: 'white',
//     left: 22,
//     top: 8,
//     zIndex: 999,
//     paddingHorizontal: 8,
//     fontSize: 14,
//   },

// })

import { useState, useMemo, useEffect } from "react";
import { authRequest, POST } from "../api";
import { modalStyle } from "./style.modal";
import { COUNTRY_TO_ROUTING_NUMBER_ALIAS } from "../utils/constants";
import { countries, currencies } from "@aerapass/country-data";
import { PaperSelect } from "react-native-paper-select";
import Modal from "react-native-modal";
import { TextInput } from "react-native-paper";
import { ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { Text, View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "react-native-vector-icons/AntDesign";
import { LinearGradient } from "react-native-linear-gradient";
import BankModel from "./bankModel";
import { alert } from "../../../../reusables/Toasts";
import Icon from "../../../../../icon";

// <===============================< Constants >==============================>
/* const TEST_EXTERNAL_ACCOUNT_DATA = {
      country: 'IN',
      currency: 'INR',
      account_number: '000123456789',
      routing_number: 'HDFC0000261',
    }*/
    const prefill = () => {
         // setIsIban(false)
          //setNewAccount({ ...TEST_EXTERNAL_ACCOUNT_DATA })
          const testData = _getExternalAccountTestData()
           setIsIban(!testData.routing_number)
           setNewAccount({ ...testData })
        }

const TEST_EXTERNAL_ACCOUNTS_DATA = [
  {
    country: "US",
    currency: "USD",
    account_number: "000123456789",
    routing_number: "110000000",
  },
  {
    country: "CA",
    currency: "CAD",
    account_number: "000123456789",
    routing_number: "11000-000",
  },
  {
    country: "FR",
    currency: "EUR",
    account_number: "FR1420041010050500013M02606",
  },
];

// const COUNTRY_CURRENCY_LIST = allCoutries()
const COUNTRY_LIST = countries.all;
const CURRENCY_LIST = currencies.all;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
// <================================< Helpers >===============================>
const _getCountryOptions = () =>
  COUNTRY_LIST.map(({ name, alpha2 }) => ({
    value: alpha2,
    label: name,
  }));

export const _getCurrencyOptions = () =>
  CURRENCY_LIST.map(({ name, code }) => ({
    value: code,
    label: `${code} (${name})`,
  }));

const _getExternalAccountTestData = () => {
  const randomIndex = Math.floor(
    Math.random() * TEST_EXTERNAL_ACCOUNTS_DATA.length
  );
  return TEST_EXTERNAL_ACCOUNTS_DATA[randomIndex];
};

// <=============================< View Functions >===========================>
export const SelectView = ({
  options,
  onChange,
  value,
  name,
  inputLabel,
  selected,
}) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "#fff" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        iconColor={"#fff"}
        data={options}
        search
        autoScroll={false}
        // maxHeight={600}
        labelField="label"
        valueField="value"
        placeholder={inputLabel}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(input) => {
          const event = {
            name: inputLabel,
            value: input.value,
            label: input.label,
          };
          console.log(event);
          onChange(event);
        }}
        // renderLeftIcon={() => (
        //   <AntDesign
        //     style={styles.icon}
        //     color={isFocus ? "blue" : "white"}
        //     name="Safety"
        //     size={20}
        //   />
        // )}
      />
    </View>
  );
};

export const NewAccountModal = ({ getAccountDetails,isVisible,setModalVisible,onPress,onCrossIcon }) => {

  const [modalMessage, setModalMessage] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isIban, setIsIban] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routingNumberAlias, setRoutingNumberAliasLabel] = useState(
    COUNTRY_TO_ROUTING_NUMBER_ALIAS.US
  );
  const countryOptions = useMemo(() => _getCountryOptions(), []);
  const currencyOptions = useMemo(() => _getCurrencyOptions(), []);
  const [selected, setSelected] = useState([]);
  const [newAccount, setNewAccount] = useState({
    country: "",
    currency: "",
    account_number: "",
    routing_number: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setNewAccount({
      country: "",
      currency: "",
      account_number: "",
      routing_number: "",
    });
    setOpen(false);
    setModalVisible(false)
  };

  const handleChange = (event) => {
    const name = event.name;
    const value = event.value;
    const newState = { ...newAccount };
    console.log(name, value);
    // Change routing number alias to specific country
    // And preset the default currency for the country
    if (name === "Country") {
      setRoutingNumberAliasLabel(
        COUNTRY_TO_ROUTING_NUMBER_ALIAS[value] ||
          COUNTRY_TO_ROUTING_NUMBER_ALIAS.US
      );

      if (COUNTRY_TO_ROUTING_NUMBER_ALIAS[value] === "IBAN") {
        setIsIban(true);
      } else {
        setIsIban(false);
      }

      console.log(
        "routing number alias: ",
        COUNTRY_TO_ROUTING_NUMBER_ALIAS[value]
      );
      newState.currency = countries[value].currencies[0] || "";
    }

    newState[name] = value;
    setNewAccount(newState);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      setLoading(true);
      const { country, account_number, currency, routing_number } = newAccount;
      if (
        !country ||
        !account_number ||
        !currency ||
        (!isIban && !routing_number)
      )
        return setModalMessage("All fields are required");

      const reqBody = { ...newAccount };
      if (isIban) delete reqBody.routing_number;

      setIsCreatingAccount(true);
      const { res, err } = await authRequest(
        "/users/createStripeAccount",
        POST,
        reqBody
      );
      if (err) return setModalMessage(`${err.status}: ${err.message}`);
      handleClose();
      setLoading(false);
      
      alert('success',"Account Added Successfully");
      getAccountDetails();
      return setModalMessage(res.data.message || "Account added successfully");
    } catch (err) {
      console.log(err);
      setLoading(false);
      setModalMessage(err.message || "Something went wrong");
    } finally {
      setIsCreatingAccount(false);
      setLoading(false);
      getAccountDetails();
      setNewAccount({
        country: "",
        currency: "",
        account_number: "",
        routing_number: "",
      });
    }
    setModalMessage("");
  };

  const prefill = () => {
    // setIsIban(false)
    //setNewAccount({ ...TEST_EXTERNAL_ACCOUNT_DATA })
    const testData = _getExternalAccountTestData();
    setIsIban(!testData.routing_number);
    setNewAccount({ ...testData });
  };

  useEffect(() => {
    // console.log(countryOptions)
  }, []);
  return (
    <>
      {/* <Button title="Add an account" onPress={handleOpen} color={"green"}>
        Add Your Bank Account
      </Button> */}
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={100}
        animationOutTiming={200}
        isVisible={isVisible}
        onBackdropPress={() => {
          handleClose();
        }}
        onBackButtonPress={() => {
          //setShowModal(!showModal);
          handleClose();
        }}
      >
        <View style={styles.modalmainContainer}>
        {/* <LinearGradient
          start={[1, 0]}
          style={{ borderRadius: 20 ,width:wp(92),alignSelf:"center"}}
          end={[0, 1]}
          colors={["rgba(22, 19, 107, 1)", "rgba(210, 88, 150, 1)"]}
        > */}
<View style={{ backgroundColor:"#011434",borderRadius: hp(2),borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",borderWidth:0.9,width:wp(92),alignSelf:"center"}}>
          <View style={styles.modelmainContainer}>
            <TouchableOpacity onPress={()=>{
              handleClose()
            }}>
            <Icon type={"entypo"} name={'cross'} color={'white'} size={24} style={styles.crossIcon}/>
            </TouchableOpacity>
            <Text style={styles.accountText}>Add Bank Account</Text>
            <Text>{modalMessage}</Text>
            {/* NOTE: bellow element is only for test and has to be removed in prod */}
            <View>
              {/* <Text>{`[ONLY FOR TEST] `}</Text>  */}
              <TouchableOpacity
                onPress={() => {
                  prefill();
                }}
              >
                <Text style={{color:"white",marginHorizontal:wp(8)}}>click here</Text>
                <Text style={{ color: "blue",marginHorizontal:wp(8) }}>
                  {" "}
                  prefill with a test bank account
                </Text>
              </TouchableOpacity> 
            </View>
            <View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropText}>Select Country</Text>
                <SelectView
                  options={countryOptions}
                  value={newAccount.country}
                  onChange={handleChange}
                  name="country"
                  inputLabel="India"
                  selected={selected}
                ></SelectView>
              </View>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropText}>Select Curency</Text>
                <SelectView
                  options={currencyOptions}
                  value={newAccount.currency}
                  onChange={handleChange}
                  name="currency"
                  inputLabel="INR"
                  selected={selected}
                ></SelectView>
              </View>
              <Text style={styles.number}>Account Number</Text>
              <TextInput
                placeholderTextColor={"white"}
                style={styles.inputContainer}
                
                id="outlined-basic"
                label={isIban ? "IBAN" : ""}
                value={newAccount.account_number}
                variant="outlined"
                //onChange={handleChange}
                
                name="account_number"
                onChangeText={(text) => {
                  let data = {
                    value: text,
                    name: "account_number",
                  };
                  handleChange(data);
                }}
              />

              <Text style={styles.number}>IFSC Code</Text>

              {!isIban && (
                <TextInput
                  style={styles.inputContainer}
                  id="outlined-basic"
                  label={routingNumberAlias}
                  value={newAccount.routing_number}
                  variant="outlined"
                  margin="normal"
                  onChange={handleChange}
                  onChangeText={(text) => {
                    let data = {
                      value: text,
                      name: "routing_number",
                    };
                    handleChange(data);
                  }}
                  name="routing_number"
                />
              )}
            </View>
            <View style={{ marginTop: hp(5) }}>
              {loading ? (
                <ActivityIndicator color={"green"} size={"large"} />
              ) : (
                <View></View>
              )}
                <TouchableOpacity  style={styles.submitgradientContainer} onPress={handleSubmit}>
              {/* <LinearGradient
                start={[1, 0]}
                end={[0, 1]}
                style={styles.submitgradientContainer}
                colors={["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"]}
              > */}
                  <Text style={{ color: "#fff" }}>Submit</Text>
              {/* </LinearGradient> */}
                </TouchableOpacity>
            </View>
          </View>
          </View>
        {/* </LinearGradient> */}
        </View>
        
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  text: {
    bottom: wp("35"),
    color: "white",
  },
  textDesign: {
    color: "white",
    fontStyle: "italic",
    fontWeight: "bold",
    marginLeft: wp("3"),
  },
  textDesign2: {
    color: "white",
    fontWeight: "bold",
    marginLeft: wp("5"),
  },
  textDesign3: {
    color: "white",
    fontWeight: "bold",
    marginLeft: wp("2"),
  },
  textDesign4: {
    color: "white",
    fontWeight: "bold",
    marginLeft: wp("4"),
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    bottom: hp("16"),
  },
  addButton: {
    display: "flex",
    paddingLeft: wp("4"),
    opacity: 0.8,
    alignItems: "center",
    textAlign: "center",
    zIndex: 11,
    backgroundColor: "grey",
    width: wp("15"),
    height: hp("6"),
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 90,
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

  dropdown: {
    width: wp("30"),
    borderRadius: 8,
    borderColor: "#407EC9",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
  },
  icon: {
    marginRight: 5,
    backgroundColor: "blue",
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: wp("13"),
    zIndex: -999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "black",
    height: hp("3"),
    bottom: hp("8"),
  },
  placeholderStyle: {
    fontSize: 13,
    color: "#fff",
  },
  selectedTextStyle: {
    fontSize: 13,
    color: "#fff",
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  modelmainContainer: {
    // backgroundColor:"red"
    paddingVertical:hp(2)
  },
  accountText: {
    textAlign: "center",
    fontSize: hp(2.5),
    fontWeight: "700",
    color: "#fff",
    
  },
  number: {
    color: "#fff",
    fontSize: 16,
    marginTop: hp(2.5),
    marginBottom: hp(2),
    marginHorizontal: wp(6),
  },
  inputContainer: {
    backgroundColor: "white",
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#407EC9",
    width: wp(80),
    height: hp(6),
    borderTopRightRadius: hp(1),
    borderBottomLeftRadius: hp(1),
    borderTopLeftRadius: hp(1),
    borderBottomRightRadius: hp(1),
    alignSelf: "center",
    color:'white'
  },
  submitgradientContainer: {
    width: wp(40),
    alignSelf: "center",
    height: hp(5),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor:"#212B53",
    borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:0.9,
  },
  dropText: {
    color: "#fff",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: hp(3),
    width: wp(75),
    alignSelf: "center",
  },
  modalmainContainer:{
    // backgroundColor:"rgba(57, 31, 125, 0.65)",
    height:hp(100),
    width:wp(100),
    justifyContent:"center",
    alignSelf:"center"
  },
  crossIcon:{
    alignSelf:"flex-end",
    padding:hp(1.5)
  }
});
