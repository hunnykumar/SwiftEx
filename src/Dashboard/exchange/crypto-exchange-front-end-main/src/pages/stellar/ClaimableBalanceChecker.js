import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_URL } from "../../../../../constants";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../../../../../Screens/ThemeColorsConfig";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

const ClaimableBalanceChecker = ({
  publicKey,
  autoFetch = false,
  onClose = () => { },
  isDark
}) => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [viewAllTx, setViewAllTx] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const theme = isDark ? colors.dark : colors.light;

  const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
  const fetchClaimableBalances = async () => {
    if (!publicKey || publicKey.length !== 56) {
      setError("Invalid Stellar public key");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await server
        .claimableBalances()
        .claimant(publicKey)
        .limit(200)
        .call();

      const records = result.records || [];

      const enriched = records.map((balance) => {
        let assetCode = "XLM";
        let assetIssuer = null;

        if (balance.asset !== "native") {
          const [code, issuer] = balance.asset.split(":");
          assetCode = code;
          assetIssuer = issuer;
        }

        return {
          ...balance,
          assetCode,
          assetIssuer,
        };
      });

      setBalances(enriched);

      if (enriched.length > 0 && autoFetch) {
        setIsVisible(true);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch claimable balances");
      setBalances([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (autoFetch && publicKey) {
      setViewAllTx(true);
      fetchClaimableBalances();
    }
  }, [publicKey, autoFetch]);

  const formatAsset = (asset) => {
    if (asset === "native" || asset.asset_type === "native") {
      return "XLM";
    }
    if (typeof asset === "string") {
      const parts = asset.split(":");
      return parts[0] || "Unknown";
    }
    if (asset.asset_code) return asset.asset_code;
    if (asset.code) return asset.code;
    return "Unknown Asset";
  };

  const formatAmount = (amount) => {
    return parseFloat(amount).toFixed(7);
  }

  const formatDate = (dateString) =>{
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timeFormatted = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return {
      date: dateFormatted,
      time: timeFormatted
    };
  }

  const renderBalanceItem = () => {
    const nextView = () => {
      if (balances.length > 0) {
        setActiveIndex((prev) => (prev + 1) % balances.length);
      }
    };
    const balance = balances[activeIndex];

    return (
      <View style={styles.assetContainer}>
        <View style={styles.assetContainerHeader}>
          <View style={styles.assetIconCon}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.assetIconGrad}
            >
              <Text style={styles.assetIcon}>{formatAsset(balance.asset)[0]}</Text>
            </LinearGradient>

            <View style={styles.assetBalCon}>
              <Text style={[styles.assetBal, {color:theme.headingTx}]}>{formatAmount(balance.amount)}</Text>
              <Text style={[styles.tokenName,{color:theme.inactiveTx}]}>{formatAsset(balance.asset)}</Text>
            </View>
          </View>


          <View style={styles.assetStatusCon}>
            <Text style={styles.assetStatusTxt}>Active</Text>
          </View>
        </View>

        <View style={[styles.assetIssuerCon]}>
          <Text style={[styles.assetIssuerSub, {color:theme.inactiveTx}]}>Asset Issuer</Text>
          <Text style={styles.assetIssuerAddress}>{balance.asset.split(":")[1].slice(0, 11)}....{balance.asset.slice(-11)}</Text>
        </View>

        <View style={[styles.assetBaseInfoCon]}>
          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, {color:theme.headingTx}]}>{balance.claimants?.length || 0}</Text>
            <Text style={[styles.assetTxtInfo, {color:theme.inactiveTx}]}>CLAIMANTS</Text>
          </View>

          <View style={[styles.assetConDiv,{backgroundColor: isDark?'rgba(255,255,255,0.4)':"gray"}]} />

          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, {color:theme.headingTx}]}>{formatDate(balance.last_modified_time).date}</Text>
            <Text style={[styles.assetBaseSub, {color:theme.inactiveTx}]}>{formatDate(balance.last_modified_time).time}</Text>
            <Text style={[styles.assetTxtInfo, {color:theme.inactiveTx}]}>CREATED</Text>
          </View>

          <View style={[styles.assetConDiv,{backgroundColor: isDark?'rgba(255,255,255,0.4)':"gray"}]} />

          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, {color:theme.headingTx}]}>{balance.sponsor?.slice(0, 3)}...
              {balance.sponsor?.slice(-3)}</Text>
            <Text style={[styles.assetTxtInfo, {color:theme.inactiveTx}]}>SPONSOR</Text>
          </View>
        </View>

        <View style={styles.assetBtnCon}>
          <TouchableOpacity
            style={[styles.assetAcceptBtnCon,{borderColor:theme.smallCardBorderColor}]}
            onPress={() => {
              Alert.alert("info", "Comming Soon")
              setIsVisible(false);
              onClose();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.assetAcceptBtnTxt, {color:theme.bg}]}>Claim Balance</Text>
          </TouchableOpacity>
          {balances.length > 1 &&
            <TouchableOpacity
              style={[styles.assetAcceptBtnCon,{borderColor:theme.smallCardBorderColor}]}
              onPress={() => {nextView()}}
              activeOpacity={0.7}
            >
              <Text style={[styles.assetAcceptBtnTxt, {color:theme.headingTx}]}>Next</Text>
            </TouchableOpacity>}
        </View>

      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setIsVisible(false);
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => {
            setIsVisible(false);
            onClose();
          }}
        />

        <View style={[styles.bottomSheet, styles.sheetBorderColor,{backgroundColor:theme.cardBg}]}>
          <View style={[styles.dragIndicator]} />
          {balances.length > 0 && !viewAllTx && (
            <>
              <Icon
                name="generating-tokens"
                size={100}
                color={"#4052D6"}
                style={{ alignSelf: "center", marginTop: 19 }}
              />
              <Text style={[styles.heading, {color:theme.headingTx}]}>Tokens Are on the Way</Text>
              <Text style={[styles.subText, {color:theme.inactiveTx}]}>Your wallet has pending transactions that need your attention. Review what’s waiting, confirm the activity, and add your new tokens safely.</Text>
              <TouchableOpacity onPress={() => { setViewAllTx(true) }} style={[styles.nextBtnCon, {backgroundColor:"#4052D6"}]}>
                <Text style={[styles.nextBtnTxt,{color:theme.bg}]}>View all</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsVisible(false) }} style={{marginBottom:"9%"}}>
                <Text style={[styles.prevBtnTxt,{color:theme.inactiveTx}]}>No, thanks</Text>
              </TouchableOpacity>
            </>
          )}
          {viewAllTx &&
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {loading && (
                <View style={styles.centerContent}>
                  <ActivityIndicator
                    size="large"
                    color={"#4052D6"}
                  />
                  <Text style={[styles.loadingText, {color:theme.inactiveTx}]}>
                    Loading claimable balances...
                  </Text>
                </View>
              )}

              {error && (
                <View style={[styles.errorContainer, {backgroundColor:theme.cardBg}]}>
                  <Icon
                    name="error-outline"
                    size={20}
                    color={isDark ? "#FCA5A5" : "#B91C1C"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.errorText, {color:theme.inactiveTx}]}>{error}</Text>
                </View>
              )}

              {hasSearched && !loading && !error && balances.length === 0 && (
                <View style={styles.centerContent}>
                  <FAIcon
                    name="search"
                    size={32}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                    style={{ marginBottom: 12 }}
                  />
                  <Text style={[styles.noResultsText, {color:theme.inactiveTx}]}>
                    No claimable balances found for this account.
                  </Text>
                </View>
              )}

              {balances.length > 0 && (
                <View style={styles.resultsContainer}>
                      {renderBalanceItem(balances)}
                </View>
              )}
            </ScrollView>
          }
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    maxHeight: SHEET_HEIGHT,
    minHeight: '41%'
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  noResultsText: {
    textAlign: "center",
    fontSize: 16,
  },
  resultsContainer: {
    paddingVertical: 8,
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  nextBtnCon: {
    marginHorizontal: 16,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  nextBtnTxt: {
    fontSize: 19,
    color: "#fff",
    fontWeight: "500"
  },
  heading: {
    fontSize: 24,
    marginTop: 15,
    marginBottom: 5,
    textAlign: "center",
    fontWeight: "500"
  },
  subText: {
    fontSize: 15,
    marginTop: 13,
    marginBottom: 17,
    textAlign: "center",
    fontWeight: "300",
    maxWidth:"90%",
    alignSelf:"center"
  },
  prevBtnTxt: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 15,
  },
  sheetBorderColor: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35
  },
  assetContainer: {
    flex: 1,
    paddingHorizontal: 1,
    paddingVertical:10
  },
  assetContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetIconCon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconGrad: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  assetIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
  },
  assetBalCon: {
    flex: 1,
  },
  assetBal: {
    fontSize: 19,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
  assetStatusCon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    zIndex: 2,
  },
  assetStatusTxt: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  assetIssuerCon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 14,
    marginBottom: 10,
  },
  assetIssuerSub: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  assetIssuerAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F8EF7',
  },
  assetBaseInfoCon: {
    flexDirection: 'row',
    borderRadius: 20,
    marginBottom: 28,
  },
  assetBaseSubCon: {
    flex: 1,
    justifyContent:"center",
    alignItems: 'center',
  },
  assetBaseHeaading: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 2,
  },
  assetBaseSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  assetTxtInfo: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  assetConDiv: {
    width: 1,
    marginHorizontal: 16,
  },
  assetBtnCon: {
    flexDirection: 'row',
    gap: 12,
  },
  assetAcceptBtnCon: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    maxWidth:"100%",
    backgroundColor:"#4052D6"
  },
  assetAcceptBtnTxt: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ClaimableBalanceChecker;