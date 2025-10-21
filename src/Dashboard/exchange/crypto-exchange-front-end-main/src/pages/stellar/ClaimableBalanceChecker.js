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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FAIcon from "react-native-vector-icons/FontAwesome";
import * as StellarSdk from '@stellar/stellar-sdk';
import { STELLAR_URL } from "../../../../../constants";
import LinearGradient from "react-native-linear-gradient";

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

  const theme = isDark ? darkTheme : lightTheme;

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
              <Text style={[styles.assetBal, theme.text]}>{formatAmount(balance.amount)}</Text>
              <Text style={styles.tokenName}>{formatAsset(balance.asset)}</Text>
            </View>
          </View>


          <View style={styles.assetStatusCon}>
            <Text style={styles.assetStatusTxt}>Active</Text>
          </View>
        </View>

        <View style={[styles.assetIssuerCon, theme.assetView]}>
          <Text style={[styles.assetIssuerSub, theme.subText]}>Issuer</Text>
          <Text style={styles.assetIssuerAddress}>{balance.asset.split(":")[1].slice(0, 10)}....{balance.asset.slice(-10)}</Text>
        </View>

        <View style={[styles.assetBaseInfoCon, theme.assetView]}>
          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, theme.text]}>{balance.claimants?.length || 0}</Text>
            <Text style={[styles.assetTxtInfo, theme.subText]}>CLAIMANTS</Text>
          </View>

          <View style={styles.assetConDiv} />

          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, theme.text]}>{formatDate(balance.last_modified_time).date}</Text>
            <Text style={[styles.assetBaseSub, theme.subText]}>{formatDate(balance.last_modified_time).time}</Text>
            <Text style={[styles.assetTxtInfo, theme.subText]}>CREATED</Text>
          </View>

          <View style={styles.assetConDiv} />

          <View style={styles.assetBaseSubCon}>
            <Text style={[styles.assetBaseHeaading, theme.text]}>{balance.sponsor?.slice(0, 3)}...
              {balance.sponsor?.slice(-3)}</Text>
            <Text style={[styles.assetTxtInfo, theme.subText]}>SPONSOR</Text>
          </View>
        </View>

        <View style={styles.assetBtnCon}>
          <TouchableOpacity
            style={[styles.assetAcceptBtnCon, theme.assetActionCon, {}]}
            onPress={() => { }}
            activeOpacity={0.8}
          >
            <Text style={[styles.assetAcceptBtnTxt, theme.text]}>Claim Balance</Text>
          </TouchableOpacity>
          {balances.length > 1 &&
            <TouchableOpacity
              style={[styles.assetAcceptBtnCon, theme.assetActionCon]}
              onPress={() => {nextView()}}
              activeOpacity={0.7}
            >
              <Text style={[styles.assetAcceptBtnTxt, theme.text]}>Next</Text>
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
          activeOpacity={1}
          onPress={() => {
            setIsVisible(false);
            onClose();
          }}
        />

        <View style={[styles.bottomSheet, theme.sheetBackground, styles.sheetBorderColor]}>
          <View style={[styles.dragIndicator, theme.drag]} />
          {balances.length > 0 && !viewAllTx && (
            <>
              <Icon
                name="generating-tokens"
                size={150}
                color={"#4F8EF7"}
                style={{ alignSelf: "center", marginTop: 19 }}
              />
              <Text style={[styles.heading, theme.text]}>Tokens Are on the Way</Text>
              <Text style={[styles.subText, theme.text]}>Your wallet has pending transactions that need your attention. Review what’s waiting, confirm the activity, and add your new tokens safely.</Text>
              <TouchableOpacity onPress={() => { setViewAllTx(true) }} style={[styles.nextBtnCon, theme.btnColor]}>
                <Text style={styles.nextBtnTxt}>See all</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setIsVisible(false) }} >
                <Text style={styles.prevBtnTxt}>No, thanks</Text>
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
                    color={isDark ? "#60A5FA" : "#3B82F6"}
                  />
                  <Text style={[styles.loadingText, theme.subText]}>
                    Loading claimable balances...
                  </Text>
                </View>
              )}

              {error && (
                <View style={[styles.errorContainer, theme.errorBackground]}>
                  <Icon
                    name="error-outline"
                    size={20}
                    color={isDark ? "#FCA5A5" : "#B91C1C"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.errorText, theme.errorText]}>{error}</Text>
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
                  <Text style={[styles.noResultsText, theme.subText]}>
                    No claimable balances found for this account.
                  </Text>
                </View>
              )}

              {balances.length > 0 && (
                <View style={styles.resultsContainer}>
                  <Text style={[styles.resultsHeader, theme.subText]}>
                    Found {balances.length} claimable balance
                    {balances.length !== 1 ? "s" : ""}:
                  </Text>
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

const lightTheme = {
  sheetBackground: { backgroundColor: "white" },
  cardBackground: { backgroundColor: "white" },
  text: { color: "#111827" },
  subText: { color: "#6B7280" },
  errorBackground: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  errorText: { color: "#B91C1C" },
  closeButton: { backgroundColor: "#F3F4F6" },
  drag: { backgroundColor: "#D1D5DB" },
  btnColor: { backgroundColor: "#4F8EF7" },
  assetView:{backgroundColor: 'rgba(86, 87, 87, 0.28)'},
  assetActionCon:{ backgroundColor: 'rgba(86, 87, 87, 0.28)'}
};

const darkTheme = {
  sheetBackground: { backgroundColor: "black" },
  cardBackground: { backgroundColor: "#1E1E1E" },
  text: { color: "#F9FAFB" },
  subText: { color: "#9CA3AF" },
  errorBackground: { backgroundColor: "#7F1D1D", borderColor: "#FECACA" },
  errorText: { color: "#FCA5A5" },
  closeButton: { backgroundColor: "#374151" },
  drag: { backgroundColor: "#4B5563" },
  btnColor: { backgroundColor: "#2164C1"}, 
  assetView:{backgroundColor: 'rgba(255,255,255,0.05)'},
  assetActionCon:{ backgroundColor: 'rgba(255,255,255,0.08)'}
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
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
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
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  nextBtnTxt: {
    fontSize: 20,
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
    fontSize: 20,
    marginTop: 15,
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "300"
  },
  prevBtnTxt: {
    fontSize: 19,
    color: "gray",
    textAlign: "center",
    marginTop: 19,
  },
  sheetBorderColor: {
    borderWidth: 1,
    borderTopColor: "#4F8EF7",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50
  },
  assetContainer: {
    flex: 1,
    paddingHorizontal: 19,
  },
  assetContainerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  assetIconCon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assetIconGrad: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'gray',
    marginRight: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 24,
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
    padding: 20,
    marginBottom: 28,
  },
  assetBaseSubCon: {
    flex: 1,
    alignItems: 'center',
  },
  assetBaseHeaading: {
    fontSize: 20,
    fontWeight: '700',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    maxWidth:"100%"
  },
  assetAcceptBtnTxt: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ClaimableBalanceChecker;