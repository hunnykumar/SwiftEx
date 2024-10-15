import React from "react";
import { FormControl, Select, Center, CheckIcon, WarningOutlineIcon, NativeBaseProvider } from "native-base";

export const FaucetDropdown = ({network, setNetwork}) => {
    const [error,setError] = React.useState(true)
  return <Center>
      <FormControl w="3/4" maxW="300" isRequired isInvalid>
        <FormControl.Label>Choose service</FormControl.Label>
        <Select minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Service" _selectedItem={{
        bg: "teal.600",
        endIcon: <CheckIcon size={5} />
      }} mt="1"
      onValueChange={(value)=>{
        console.log(value)
        if(!value)
        {
            setError(true)
            return
        }
        setNetwork(value)
        setError(false)
      }}
      >
          
          <Select.Item label="Ethereum" value="Ethereum" />
          <Select.Item label="Binance smart chain" value="BSC" />
          <Select.Item label="polygon" value="Matic" />
        </Select>
        {
        error && (
            <FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
          Please make a selection!
        </FormControl.ErrorMessage>
            )   
        }
      </FormControl>
    </Center>;
};

  