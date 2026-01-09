import AsyncStorage from '@react-native-async-storage/async-storage';

const ShortTermStorage = {
  async saveTx(activeWalletPublicKey, data) {
    try {
      const key = `App_+_+Storage${activeWalletPublicKey}`;
      const existingResponse = await this.getWalletTx(activeWalletPublicKey);
      const existingData = existingResponse.status ? existingResponse.data : [];

      const txObject = {
        chain: data.chain,
        typeTx: data.typeTx,
        status: data.status,
        hash: data.hash,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedData = [...existingData, txObject];

      await AsyncStorage.setItem(key, JSON.stringify(updatedData));

      return {
        status: true,
        data: updatedData,
      };
    } catch (error) {
      console.log('ShortTermStorage save error', error);
      return {
        status: false,
        data: [],
      };
    }
  },

  async getWalletTx(activeWalletPublicKey) {
    try {
      const key = `App_+_+Storage${activeWalletPublicKey}`;
      const data = await AsyncStorage.getItem(key);

      return {
        status: !!data,
        data: data ? JSON.parse(data) : [],
      };
    } catch (error) {
      console.log('ShortTermStorage get error', error);
      return {
        status: false,
        data: [],
      };
    }
  },

  async updateTxStatus(activeWalletPublicKey, updateData) {
    try {
      const response = await this.getWalletTx(activeWalletPublicKey);
      if (!response.status) {
        return { status: false, message: 'No transactions found' };
      }

      const updatedData = response.data.map(tx => {
        if (tx.hash === updateData.hash && tx.chain === updateData.chain) {
          return {
            ...tx,
            status: updateData.status,
            updatedAt: Date.now(),
          };
        }
        return tx;
      });

      const key = `App_+_+Storage${activeWalletPublicKey}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));

      return {
        status: true,
        data: updatedData,
      };
    } catch (error) {
      console.log('ShortTermStorage update error', error);
      return {
        status: false,
        error: error.message,
      };
    }
  },
  async removeTxByHash(activeWalletPublicKey, hash, chain) {
  try {
    const key = `App_+_+Storage${activeWalletPublicKey}`;
    const data = await AsyncStorage.getItem(key);

    if (!data) return { status: false };

    const parsed = JSON.parse(data);

    const filtered = parsed.filter(
      tx => !(tx.hash === hash && tx.chain === chain)
    );

    await AsyncStorage.setItem(key, JSON.stringify(filtered));

    return { status: true };
  } catch (error) {
    console.log("removeTxByHash error", error);
    return { status: false };
  }
}

};

export default ShortTermStorage;