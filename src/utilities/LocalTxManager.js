import AsyncStorage from '@react-native-async-storage/async-storage';

const LocalTxManager = {
  async saveTx(activeWalletPublicKey, data) {
    try {
      const key = `walletCrossChainTx${activeWalletPublicKey}`;
      const existingResponse = await this.getWalletTx(activeWalletPublicKey);
      const existingData = existingResponse.status ? existingResponse.data : [];
      const updatedData = [...existingData, data];
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));
      console.log('LocalTxManager save true.');
      return {
        status: true,
        data: updatedData
      };
    } catch (error) {
      console.log('LocalTxManager error on save ', error);
      return {
        status: false,
        data: []
      };
    }
  },
  async getWalletTx(activeWalletPublicKey) {
    try {
      const key = `walletCrossChainTx${activeWalletPublicKey}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return {
          status: true,
          data: JSON.parse(data)
        };
      } else {
        return {
          status: false,
          data: []
        };
      }
    } catch (error) {
      console.log('LocalTxManager error get all data', error);
      return {
        status: false,
        data: []
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
            statusColor: updateData.statusColor,
            lastUpdated: Date.now()
          };
        }
        return tx;
      });

      const key = `walletCrossChainTx${activeWalletPublicKey}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));

      console.log('Status updated successfully:', updateData);
      return {
        status: true,
        data: updatedData
      };
    } catch (error) {
      console.log('LocalTxManager error updating status', error);
      return {
        status: false,
        error: error.message
      };
    }
  },
};
export default LocalTxManager;