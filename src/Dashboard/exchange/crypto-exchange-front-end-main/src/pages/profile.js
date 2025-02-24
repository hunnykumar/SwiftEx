import React from "react";
import { useEffect, useState } from "react";
import { authRequest, GET, POST } from "../api";
import { Navbar } from "../components/nav";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import Bridge from "../../../../../../assets/Bridge.png";
import { useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import editImage from "../../../../../../assets/editImage.png";
// import girlProfile from "../../../../../../assets/girlProfile.jpg";
import Profile from "../../../../../../assets/Profile.png"
import walletImg from "../../../../../../assets/walletImg.png";
import copyRide from "../.././../../../../assets/copyRide.png";
import { REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import darkBlue from "../../../../../../assets/darkBlue.png";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ActivityIndicator } from "react-native-paper";
import Icon from "../../../../../icon";
import { LinearGradient } from "react-native-linear-gradient";
import { NewAccountModal } from "../components/newAccount.model";
import BankModel from "../components/bankModel";
import idCard from "../../../../../../assets/idCard.png";
import  Clipboard from "@react-native-clipboard/clipboard";
import { alert } from "../../../../reusables/Toasts";
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
import {Exchange_profile_loading} from "../../../../reusables/Exchange_loading";
import DeviceInfo from "react-native-device-info";
const VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  UNVERIFIED: "UNVERIFIED",
  SUBMITTING: "SUBMITTING",
  OTP_SENT: "OTP_SENT",
  UPDATE_ON: "UPDATE_ON",
};

const VerifyActionButtonView = ({ onSubmit, status }) => {
  if (status === VERIFICATION_STATUS.VERIFIED) {
    return <Icon
    name={"check-outline"}
    type={"materialCommunity"}
    color={"#008C62"}
    style={styles.checkImg}
  />;
    //  <Icon name="verified" size={20} color={'red'} />;
  }

  if (status === VERIFICATION_STATUS.UNVERIFIED) {
    return <TouchableOpacity style={styles.resend1} onPress={onSubmit}>
      <Text style={{color:"white",fontSize:12}}>Verify</Text>
    </TouchableOpacity>;
    //  <View style={{ flexDirection: "row", marginLeft: wp(10) }}>
    //   <Icon
    //     type={"materialCommunity"}
    //     name={"check-outline"}
    //     size={hp(2)}
    //     color={"#698C81"}
    //     onPress={onSubmit}
    //   />
    //   <Text style={styles.verifiedText}>Identity Verified!</Text>
    // </View>
  }

  if (status === VERIFICATION_STATUS.UPDATE_ON) {
    return <Button title="update" color={"blue"} onPress={onSubmit}></Button>;
  }

  if (status === VERIFICATION_STATUS.OTP_SENT) {
    return (
      <TouchableOpacity style={styles.resend} onPress={onSubmit}>
        <Text style={{ color: "white", fontSize: 12 }}>Resend OTP</Text>
      </TouchableOpacity>
    );
  }

  if (status === VERIFICATION_STATUS.SUBMITTING) {
    return <ActivityIndicator size={"small"} color={"blue"} />;
  }
};

export const FieldView = ({
  valueStyle,
  emailStyle,
  title,
  value,
  type,
  applyForKyc,
  disabled = true,
}) => {
  return (
    // <>
    //    {type === "kyc" && value == true ? (
    //     <>
    //       <View style={styles.idCardContainer}>
    //         <View style={styles.walletContainer}>
    //           <Text style={styles.idtext}>Identity Status</Text>
    //           <Image source={idCard} style={styles.idcardImg} />
    //         </View>
    //         <View style={styles.walletContainer}>
    //           <Icon
    //             name={"check-outline"}
    //             type={"materialCommunity"}
    //             color={"#008C62"}
    //             style={styles.checkImg}
    //           />
    //           <Text style={styles.connectedText}>Verified!</Text>
    //         </View>
    //       </View>
    //       <Text style={styles.readyText}>You are ready to</Text>
    //     </>
    //   ) : (
    //     <Button
    //       title="apply"
    //       onPress={() => {
    //         applyForKyc();
    //       }}
    //     />
    //   )}
    // </>

    <View>
      {type === "kyc" ? (
        <>
          {/* <Text style={styles.KYC}>
            KYC STATUS{" "}
            {value === false ? (
              "FALSE"
            ) : (
              <Icon
                name={"check-outline"}
                type={"materialCommunity"}
                color={"#008C62"}
                style={styles.checkImg}
              />
            )}
          </Text> */}

        </>
      ) : (
        <>
          <Text style={{ color: "#CBBBDC" }}>{title}</Text>
          <Text style={[styles.valueColor, valueStyle]} numberOfLines={1}>
            {value}
          </Text>
        </>
      )}
    </View>
  );
};

const EmailView = ({ value, isVerified, emailStyle }) => {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(value);
  const [message, setMessage] = useState("");
  const [isOtpSubmiting, setIsOtpSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(
    isVerified ? VERIFICATION_STATUS.VERIFIED : VERIFICATION_STATUS.UNVERIFIED
  );

  useEffect(() => {
    console.log(isVerified);
    setEmail(value);
  }, [value]);

  useEffect(() => {
    if (isVerified) setVerificationStatus(VERIFICATION_STATUS.VERIFIED);
    if (!isVerified) setVerificationStatus(VERIFICATION_STATUS.UNVERIFIED);
  }, [isVerified]);

  const handleEmailChange = (e) => {
    setMessage("");
    console.log(e);
    let newValue = e;
    if (newValue === value) {
      setVerificationStatus(
        isVerified
          ? VERIFICATION_STATUS.VERIFIED
          : VERIFICATION_STATUS.UNVERIFIED
      );
    } else {
      setVerificationStatus(VERIFICATION_STATUS.UPDATE_ON);
    }
    setEmail(e);
  };
  const handleOtpChange = (e) => setOtp(e);

  const submitEmail = async () => {
    if (verificationStatus === VERIFICATION_STATUS.UPDATE_ON)
      return await submitEmailUpdate();
    return await submitEmailVerification();
  };

  const submitEmailVerification = async () => {
    try {
      setVerificationStatus(VERIFICATION_STATUS.SUBMITTING);
      const { err } = await authRequest("/users/verifyUserEmail", POST, {
        email,
      });
      if (err) throw new Error(err.message);
      setVerificationStatus(VERIFICATION_STATUS.OTP_SENT);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
      setVerificationStatus(VERIFICATION_STATUS.UNVERIFIED);
    }
  };

  const submitEmailUpdate = async () => {
    try {
      setVerificationStatus(VERIFICATION_STATUS.SUBMITTING);
      const { err } = await authRequest("/users/updateEmail", POST, {
        email,
      });
      if (err) throw new Error(err.message);
      setVerificationStatus(VERIFICATION_STATUS.UNVERIFIED);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
      setVerificationStatus(VERIFICATION_STATUS.UPDATE_ON);
    }
  };

  const submitOtp = async () => {
    try {
      setIsOtpSubmitting(true);
      const { err } = await authRequest("/users/verifyUserEmail", POST, {
        email,
        otp,
      });
      if (err) throw new Error(err.message);
      setVerificationStatus(VERIFICATION_STATUS.VERIFIED);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const OutlinedInput = ({ EndAdornment, type }) => {
    return (
      <View
        style={{
          width: wp(60),
          display: "flex",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        {type === "email" ? (
          <EndAdornment status={verificationStatus} onSubmit={submitEmail} />
        ) : isOtpSubmiting ? (
          <ActivityIndicator size={"small"} color={"blue"} />
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={submitOtp}>
            <Text>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          width: wp(85),
          marginTop: hp(3),
          justifyContent: "space-between",
        }}
      >
        {/* <TextInput
          numberOfLines={1}
          style={[styles.input, emailStyle]}
          theme={{ colors: { text: "white" } }}
          value={email}
          placeholder={email}
          onChangeText={(text) => {
            // onChange(text)
            handleEmailChange(text);
          }}
          autoCapitalize={"none"}
          placeholderTextColor="#FFF"
        />
        <OutlinedInput EndAdornment={VerifyActionButtonView} type="email" /> */}
      </View>
      {verificationStatus === VERIFICATION_STATUS.OTP_SENT && (
        <View>
          <TextInput
            style={styles.input}
            theme={{ colors: { text: "white" } }}
            value={otp}
            placeholder={email}
            onChangeText={(text) => {
              // onChange(text)
              handleOtpChange(text);
            }}
            autoCapitalize={"none"}
            placeholderTextColor="#FFF"
          />
          <OutlinedInput
            EndAdornment={
              isOtpSubmiting ? (
                <ActivityIndicator size={"small"} color={"blue"} />
              ) : (
                <Button title="Submit" onPress={submitOtp}>
                  submit
                </Button>
              )
            }
            type="otp"
          />
        </View>
      )}
      <Text style={{ color: "red" }}>{message}</Text>
    </View>
  );
};

export const ProfileView = (props) => {
  const { emailStyle } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [Load, setLoad] = useState(true);
  const state = useSelector((state) => state);
  const [profile, setProfile] = useState({
    isVerified: false,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    walletAddress: "",
    isEmailVerified: false,
  });
  const [message, setMessage] = useState("");
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalContainer_menu,setmodalContainer_menu]=useState(false);
  const [avl_plan, setavl_plan] = useState([
    { id: 1, month: "1 Year", save_on_price: 16, org_price: "5", current_price: "Free", type: "Yearly", subscriber_type: "" },
    { id: 2, month: "1 month", save_on_price: 16, org_price: "5", current_price: "Free", type: "Monthly", subscriber_type: "" },
    { id: 3, month: "3 month", save_on_price: 16, org_price: "15", current_price: "$ 14.6", type: "Quarter", subscriber_type: "MOST POPULAR" },
    { id: 4, month: "Yearly", save_on_price: 16, org_price: "60", current_price: "$ 58", type: "Yearly", subscriber_type: "BEST VALUE" }
  ]);
  const [expire_plan, setexpire_plan] = useState("");
  const [subscription_id,setsubscription_id]=useState(0);
  const FOUCUSED=useIsFocused();
  useEffect(() => {
    fetchProfileData();
  }, [FOUCUSED]);

  useEffect(() => {
    // setsubscription_id(1)
    const res = PlanExpire(avl_plan[subscription_id].type)
    setexpire_plan(res);
  }, [subscription_id]);

  useEffect(() => {
    getAccountDetails();
  }, []);

  const PlanExpire = (time_line,startingDate) => {
    let today = startingDate ? new Date(startingDate) : new Date();
    let expire_date = new Date(today);

    switch (time_line) {
        case '1 month':
            expire_date.setMonth(expire_date.getMonth() + 1);
            break;
        case '3 month':
            expire_date.setMonth(expire_date.getMonth() + 3);
            break;
        case 'Yearly':
            expire_date.setFullYear(expire_date.getFullYear() + 1);
            break;
        default:
            return 'Invalid subscription time line.';
    }

    const day = expire_date.getDate();
    const year = expire_date.getFullYear();
    const months = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];
    const month = months[expire_date.getMonth()];
    return `Valid till ${day} ${month} ${year}`;
}

  const getAccountDetails = async () => {
    setIsLoading(true);
    try {
      const { res, err } = await authRequest("/users/getStripeAccount", GET);
      if (err) return setMessage(` ${err.message}`);
      setIsLoading(false);
      setAccount(res);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoad(true)
      const { res, err } = await authRequest("/users/:id", GET);
      console.log("----ATAEWWW---",err,res)
      if (err) return [setLoad(true),setMessage(`${err.status}: ${err.message}`)];
      setProfile(res);
      setLoad(false)
      if (res?.createdAt) {
        const expireRes = PlanExpire(avl_plan[subscription_id].type,res?.createdAt)
        setexpire_plan(expireRes);
      }
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
      setLoad(true);
    }
  };

  const applyForKyc = async () => {
    try {
      const { err } = await authRequest("/users/kyc", POST);
      if (err) return setMessage(`${err.status}: ${err.message}`);

      await fetchProfileData();
      return setMessage("KYC success");
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    }
  };

  const data = [
    // {
    //   bankname: "HDFC",
    //   bankholder: "Rosie Jackson",
    //   payoutType: "Standard",
    //   country: "India",
    //   currency: "INR",
    // },
  ];
  const navigation = useNavigation();
  const copyToClipboard = () => {
    Clipboard.setString(state.STELLAR_PUBLICK_KEY);
    alert("success", "Copied");
  };
  const logout_functio=async()=>{
    try {
      console.log('clicked');
      const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
      await AsyncStorage.removeItem(LOCAL_TOKEN);
      setmodalContainer_menu(false)
      navigation.navigate('exchangeLogin');
    } catch (error) {
      console.log("--===9",error)
    }
  }
  return (
    <>
    <Exchange_screen_header title="Profile" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
    <View>
      <View style={styles.content}>
        <View style={styles.profileContainer}>
        {Load?
      <Exchange_profile_loading/>
      :  
              profile?.email === DeviceInfo?.getUniqueIdSync() ?
                <View style={styles.guesetUserCon}>
                  <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.tokenImage]}
                  >
                    <Text style={[styles.tokenName, { color: "#fff", fontSize: 28 }]}>{profile?.firstName?.charAt(0)?.toLocaleUpperCase()}</Text>
                  </LinearGradient>
                  <View style={{justifyContent:"center",alignItems:"flex-start",marginBottom:-8,width:"90%",marginLeft:8}}>
                    <View style={{flexDirection:"row",width:"90%",justifyContent:"space-between",alignItems:"center"}}>
                      <Text style={[styles.guesetUserCon.userName]}>{profile?.firstName}</Text>
                      <TouchableOpacity style={styles.amountSugCon.amountSugCard} onPress={() => { navigation.navigate("exchangeLogin") }}>
                        <Text style={styles.amountSugCon.amountSugCardText}>Log In</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.guesetUserCon.userName,{fontSize:15,color:"gray"}]}>You're in Guest Mode. Sign in for full access.</Text>
                  </View>
                </View>
      :
      <>
            {/* <Icon
              name={"account-circle-outline"}
              type={"materialCommunity"}
              color={"white"}
              size={60}
              style={{ marginTop: 10 }}
            /> */}
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.tokenImage]}
                >
                  <Text style={[styles.tokenName, { color: "#fff", fontSize: 28 }]}>{profile?.firstName?.charAt(0)?.toLocaleUpperCase()}</Text>
                </LinearGradient>
            <View style={[styles.fnlnTextView]}>
              <Text style={{ fontSize: hp(2), color: "white", fontSize: hp(2.3), width: wp(63),marginLeft:wp(1.2) }}>{profile?.firstName + " " + profile?.lastName}</Text>
              <View style={styles.verifiedTextCon}>
                <Text style={styles.verifiedText}>Verified!</Text>
              </View>
            </View>
            <View style={styles.emailphoneView}>
              <Text style={{ color: "white", fontSize: 16 }}>Email</Text>
              <Text style={{ color: "white", marginTop: 4, fontSize: 16 }}>{profile?.email}</Text>
            </View>
            </>
            }
          </View>

          <View>
    {/* <Image source={darkBlue} style={{ height: hp("9"),width: wp("12"),alignSelf:"flex-end",position:"absolute"}} /> */}
        <View style={{justifyContent:"center",marginTop:hp(2.7)}}>

        {/* <Text style={{color:"#35CA1D",fontSize:16,alignSelf:"flex-end",position:"absolute"}}>SwiftEx</Text> */}
        <FieldView
          title="KYC Status"
          value={profile.isVerified}
          applyForKyc={applyForKyc}
          type="kyc"
        />
        </View>
        </View>

        <View style={styles.walletCard}>
          {/* <LinearGradient
            start={[1, 0]}
            end={[0, 1]}
            colors={["rgba(223, 172, 196, 1)", "rgba(192, 197, 234, 1)"]}
            style={styles.linearContainer}
          > */}

<View  style={[styles.linearContainer]}>
            <View style={styles.iconwithTextContainer}>
              <View style={styles.walletContainer}>
                <Text style={styles.myWallet}>My Wallet </Text>
                {/* <Icon
                      name={"wallet"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={24}
                    /> */}
                {/* <Image source={walletImg} style={styles.walletImg} /> */}
              </View>
              <View style={styles.walletContainer}>
              
                <Text style={styles.connectedText}>Connected!</Text>
              </View>
            </View>

            <View style={styles.copyRideContainer}>
             
              <View style={{borderColor:"#485DCA",borderWidth:0.9,borderRadius:5,flexDirection:"row"}}>

               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(70),marginTop:1.9}}>
                   <Text style={{color:"#fff",margin:5,padding:3}}>{state.STELLAR_PUBLICK_KEY}</Text>
                    </ScrollView>
              <View style={{ marginHorizontal:1,marginLeft:10 }}>
              
                <TouchableOpacity onPress={()=>{copyToClipboard()}}>
                <Icon
                      name={"content-copy"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={24}
                      style={{marginTop:0.3}}
                      />
                <Text style={styles.copyText}>copy</Text>
                </TouchableOpacity>
              </View>
                      </View>
            </View>
            </View>
          {/* </LinearGradient> */}
          <Text style={styles.heading_text}>Activated Subcription</Text>
        <TouchableOpacity style={styles.plan_details} onPress={()=>{navigation.navigate("Subscription_det",{ID:subscription_id})}}>
                    <View style={styles.Check_box}>
                        <Icon name={"check"} type={"materialCommunity"} size={28} color={"#fff"} />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: wp(5) }}>
                        <View style={[styles.right_container, { alignItems: "flex-start", }]}>
                            <Text style={styles.comman_text}>{avl_plan[subscription_id].month}</Text>
                            <Text style={styles.expire_text}>{expire_plan}</Text>
                        </View>

                        <View style={[styles.right_container, { marginRight: wp(2) }]}>
                            <Text style={styles.comman_text_1}>{avl_plan[subscription_id].current_price}</Text>
                            <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "400" }]}>{avl_plan[subscription_id].type}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
        <View>
        </View>
          <EmailView
            numberOfLines={1}
            emailStyle={styles.emailText}
            value={profile.email}
            isVerified={profile.isEmailVerified}
          />
        </View>
        
      {/* {isLoading===true?<ActivityIndicator color="green"/>: */}
        
        {/* // account ? (
          <>
          <View style={styles.deleteContainer}>
            <Text style={styles.accountText}>Account Details</Text>
            <View style={{ alignItems: "center" }}>
              <Icon
                name={"delete"}
                type={"materialCommunity"}
                size={hp(2)}
                color={"#E96A6A"}
              />
              <Text style={styles.deleteText}>Delete</Text>
            </View>
          </View>
            <View style={styles.tableContainer}>

              <View  style={{
                  borderRadius: wp(3),
                  borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
                  borderWidth: 1,
                  backgroundColor:"#212B53"
                }} >
                <View style={styles.assetTextContainer}>

                   <Text style={styles.amountText}>Bank</Text>
                  <Text style={styles.amountText}>Holder</Text>
                  <Text style={styles.amountText}>Payout</Text>
                  <Text style={styles.amountText}>Country</Text>
                  <Text style={styles.amountText}>Currency</Text>
                </View>
                {account.external_accounts.data.map((item, index) => {
                  return (
                    <View style={styles.activeTextConatiner} key={index}>
                      <Text style={styles.amountText}>{item.bank_name}</Text>
                      <Text style={styles.amountText}>
                        {item.account_holder_name}
                      </Text>
                      <Text style={styles.amountText}>
                        {item.available_payout_methods[0]}
                      </Text>
                      <Text style={styles.amountText}>{item.country}</Text>
                      <Text style={styles.amountText}>{item.currency}</Text>
                    </View>
                  );
                })} */}
              {/* </LinearGradient> */}
              {/* </View>
            </View>
            <View style={styles.enableContainer}>
              <Text style={styles.enableText}>Charges Enabled: No</Text>
              <Text style={styles.payoutText}>Payout Enabled: No</Text>
            </View>
          </> */}
        {/* ) : ( */}
        {/* <View>
            <Text style={styles.addedText}>No Bank Account Added!</Text>

               <View style={styles.addacountBtn}> */}
              {/* <TouchableOpacity
                style={{
                  paddingVertical: hp(1),
                  width: wp(50),
                  alignItems: "center",
                  backgroundColor:"#212B53",
                  borderRadius: hp(2),
                  borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
                  borderWidth:0.9
                }}
                onPress={() => {
                  setModalVisible(!modalVisible);
                }}
              >
                <Text style={styles.accounttextColor}>Add Bank Account</Text>
              </TouchableOpacity>
              </View> */}
            {/* </LinearGradient> */}
            {/* <NewAccountModal
              onCrossIcon={() => {
                setModalVisible(false);
              }}
              isVisible={modalVisible}
              setModalVisible={setModalVisible}
              getAccountDetails={getAccountDetails}
              onPress={() => {
                setModalVisible(!modalVisible);
                setIsSubmit(!isSubmit);
              }}
            /> */}
            {/* <BankModel
              isVisible={isSubmit}
              onPress={() => {
                setIsSubmit(!isSubmit);
              }}
            />
          </View> */}
        {/* )} */}
      </View>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    height: hp(100),
    width: wp(100),
  },
  tableHeader: {
    backgroundColor: "#DCDCDC",
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: 20,
  },
  content: {
    backgroundColor: "#011434",
    alignItems: "center",
    textAlign: "center",
    height: hp(100),
    width: wp(100),
  },
  fieldView: {
    display: "flex",
    flexDirection: "row",
    marginTop: 30,
  },
  input: {
    marginBottom: hp("2"),
    marginTop: hp("1"),
    borderColor: "#407EC9",
    textAlign: "center",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
  },
  img: {
    height: hp(6),
    width: wp(12),
    borderRadius: hp(5),
    // marginLeft: wp(3),
    borderColor:"gray",
    borderWidth:1.9
  },
  profileContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    marginTop: hp(2),
    width: wp(95),
    borderWidth: StyleSheet.hairlineWidth * 1,
    paddingVertical: hp(1),
    borderRadius: hp(2),
    borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:0.9,
    paddingBottom:19
  },
  verifiedText: {
    color: "white",
    fontSize: hp(2),
    textAlign:"center"
  },
  verifiedTextCon:{ 
    flexDirection: "row", 
    marginLeft: wp(5),
    backgroundColor:"#2DAA2069",
    width: wp(20),
    height:hp(3),
    justifyContent:"center",
    alignItems:"center",
    borderRadius:10
   },
    fnlnTextView: {
    marginTop: hp(3),
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf:"center",
    width: wp(90),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    paddingBottom: hp(1.6),
    borderColor: "#659DEA",
  },
  emailphoneView: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    marginTop: hp(3),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    paddingBottom: hp(1.6),
    borderColor: "#659DEA",
    width: wp(88),
  },
  editimgStyle: {
    height: hp(4),
    width: wp(8),
    alignSelf: "flex-end",
    marginRight: hp(2),
  },
  valueColor: { color: "#CBBBDC" },
  nameText: {
    width: wp(90),
    fontSize:16,
    color:"white",
    fontWeight:"bold"
  },
  walletCard: {
    width: wp(95),
    marginTop: hp(1),
    alignSelf: "center",
  },
  linearContainer: {
    padding: hp(2),
    borderWidth: StyleSheet.hairlineWidth * 1,
    paddingVertical: hp(4),
    borderRadius: hp(2),
    borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:0.9
  },
  iconwithTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: hp(1),
  },
  myWallet: {
    fontWeight: "bold",
    fontSize:20,
    color:"#fff"
  },
  walletImg: {
    height: hp(2),
    width: wp(4),
  },
  connectedText: {
    color: "#008C62",
  },
  copyRideContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: wp(6.8),
  },
  copyTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: wp(4),
  },
  copyText: {
    color: "#fff",
    textAlign: "center",
    marginBottom:1
  },
  emailText: {
    color: "#fff",
  },
  accountText: {
    color: "#fff",
    fontSize: hp(2.3),
  },
  deleteContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(0),
    width: wp(85),
  },
  deleteText: {
    color: "#E96A6A",
  },
  assetTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(93),
    padding: hp(2),
    alignItems: "center",
    paddingVertical: hp(2),
    borderBottomColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
  },
  tableContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
    alignSelf: "center",
    marginTop: hp(1),
  },
  statustext: {
    width: wp(20),
    color: "#fff",
  },
  amountText: {
    color: "#fff",
    width: wp(16),
    // textAlign:"center"
  },
  standardText: {
    color: "#fff",
  },
  infoIcon: {
    alignSelf: "flex-end",
    position: "absolute",
    top: -8,
    right: -13,
  },
  activeTextConatiner: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(2),
    justifyContent: "space-between",
    width: wp(93),
    paddingVertical: hp(2),
  },
  textColor: {
    color: "#fff",
  },
  bidText: {
    color: "#fff",
    textAlign: "center",
  },
  BidsBtn: {
    width: wp(20),
    height: hp(3.5),
    justifyContent: "center",
    borderRadius: wp(1.6),
    marginHorizontal: wp(4),
    backgroundColor: "#010C66",
    marginBottom: hp(2),
  },
  enableText: {
    color: "#CBBBDC",
    fontSize: hp(1.5),
    margin: 5,
  },
  enableContainer: {
    display: "flex",
    flexDirection: "row",
    marginHorizontal: wp(5),
    marginVertical: hp(2),
    justifyContent: "space-evenly",
  },
  payoutText: {
    color: "#CBBBDC",
    fontSize: hp(1.5),
    margin: 5,
  },
  borderStyle: {
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#659DEA",
    paddingBottom: hp(2),
    width: wp(90),
    alignSelf: "center",
  },
  addedText: {
    color: "#CE6064",
    textAlign: "center",
    fontSize: hp(2.8),
    marginTop: hp(3),
  },
  addacountBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: wp(50),
    alignSelf: "center",
    marginTop: hp(3),
    borderRadius: 8,
  },
  accounttextColor: {
    color: "#fff",
  },
  idCardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(88),
    marginTop: hp(3),
    paddingBottom: hp(1),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderBottomColor: "#529C8C",
  },
  idcardImg: {
    height: hp(2),
    width: wp(4),
    marginHorizontal: hp(1),
  },
  checkImg: {
    marginHorizontal: hp(0.6),
  },
  idtext: {
    color: "#CBBBDC",
  },
  checkImg: {
    marginHorizontal: hp(0.6),
  },
  connectedText: {
    // color: "#008C62",
        color: "#35CA1D",
  },
  readyText: {
    color: "#fff",
    fontSize: hp(2.3),
    textAlign: "center",
    marginVertical: hp(2),
  },
  KYC: {
    color: "#fff",
  },
  submitBtn: {
    backgroundColor: "#659DEA",
    // alignSelf: "flex-end",
    alignItems: "center",
    width: wp(20),
    paddingVertical: hp(0.7),
    borderRadius: hp(1),
    marginLeft: wp(30),
  },
  resend: {
    backgroundColor: "blue",
    width: wp(24),
    alignItems: "center",
    borderRadius: hp(1),
    padding: hp(1),
    marginTop: hp(1),
  },
  resend1:{
    backgroundColor: "blue",
    width: wp(20),
    alignItems: "center",
    borderRadius: hp(1),
    padding: hp(0.7),
    marginTop: hp(1),
  },
  headerContainer1_TOP: {
    backgroundColor: "#4CA6EA",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(2),
  },
  logoImg_TOP: {
    height: hp("8"),
    width: wp("12"),
    marginLeft: wp(21.4),
  },
  text_TOP: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    // textAlign: "center",
    // marginStart:wp(34)
    marginStart:wp(34)
  },
  text1_ios_TOP: {
    alignSelf:"center",
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:hp(3),
  },
  modalContainer_option_top: {
    // flex: 1,
    alignSelf:"flex-end",
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width:"100%",
    height:"60%",
  },
  modalContainer_option_sub:{
    alignSelf:"flex-end",
    backgroundColor: 'rgba(33, 43, 83, 1)',
  padding: 10,
  borderRadius: 10,
  width:"65%",
  height:"70%"
},
modalContainer_option_view:{
  flexDirection:"row",
  marginTop:25,
  alignItems:"center",
},
modalContainer_option_text:{
fontSize:20,
fontWeight:"bold",
color:"gray",
marginStart:5
},
plan_details: {
  backgroundColor: "rgba(42, 84, 156, 1)rgba(43, 82, 147, 1)",
  borderRadius: 10,
  paddingVertical: wp(5),
  width:wp(95)
},
Check_box: {
  alignContent:"center",
  justifyContent:"center",
  top: hp(-1),
  height: hp(3.4),
  width: wp(7.5),
  backgroundColor: "rgba(230, 114, 41, 1)rgba(230, 161, 32, 1)",
  borderRadius: 24,
  position: "absolute",
  marginLeft: wp(-1.4),
},
right_container: {
  alignItems: "center",
  paddingVertical: hp(0.5),
  paddingLeft: wp(2)
}, comman_text: {
  color: "#fff",
  fontSize: 26,
  fontWeight: "800"
},
expire_text: {
  color: "orange",
  fontSize: 12,
  fontWeight: "500",
  marginTop: hp(0.2)
},
comman_text_1: {
  color: "#fff",
  fontSize: 24,
  fontWeight: "800"
},
heading_text:{
  color: "#fff",
  fontSize: 19,
  fontWeight: "600",
  paddingVertical:hp(1.4)
},
tokenImage: {
  width: 53,
  height: 53,
  marginTop: 10,
  borderRadius: 30,
  justifyContent: "center",
  alignItems: "center" 
},
tokenName: {
  fontSize: 16,
  fontWeight: 'bold',
  textAlign:"center"
},
guesetUserCon: {
  width: "100%",
  flexDirection:"row",
  justifyContent:"flex-start",
  alignItems:"center",
  alignSelf:"center",
  paddingHorizontal:10,
  userName: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color:"#fff"
  }
},
amountSugCon: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 6.9,
  paddingHorizontal: 5,
  amountSugCard: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 33,
    borderRadius: 8,
    backgroundColor: "#23262F"
  },
  amountSugCardText: {
    color: "#FFFFFF",
    fontSize: 16
  }
},
});
