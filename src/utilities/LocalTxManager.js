import AsyncStorage from '@react-native-async-storage/async-storage';

const LocalTxManager = {
  async saveTx(activeWalletPublicKey, data) {
    try {
      const key = `walletCrossChainTx${activeWalletPublicKey}`;
      const existingResponse = await this.getWalletTx(activeWalletPublicKey);
      const existingData = existingResponse.status ? existingResponse.data : [];
      const dataWithTimestamp = {
        ...data,
        timestamp: data?.timestamp ?? Date.now(),
      };

      let updatedData = [dataWithTimestamp, ...existingData];
      const BLOCKED_STATUS = ['pending', 'processing', 'process'];
      if (updatedData.length > 5) {
        const removableTx = updatedData.filter(
          tx => !BLOCKED_STATUS.includes(String(tx.status).toLowerCase())
        );
        while (updatedData.length > 5 && removableTx.length > 0) {
          const txToRemove = removableTx.pop();
          const index = updatedData.indexOf(txToRemove);
          if (index !== -1) {
            updatedData.splice(index, 1);
          }
        }
      }

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
        const parsedData = JSON.parse(data);
        const filteredData = parsedData.filter(tx => {
          const status = tx.status?.toLowerCase();
          return status !== 'completed';
        });

        if (filteredData.length < parsedData.length) {
          await AsyncStorage.setItem(key, JSON.stringify(filteredData));
          console.log(`Removed ${parsedData.length - filteredData.length} completed transactions from storage`);
        }

        return {
          status: true,
          data: filteredData
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