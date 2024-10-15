import { Button, View } from 'react-native'

const BidAccepted = ({ notification, setNotification }) => {
  const onProceed = () => {
    window.open(notification.paymentUrl, '_blank', 'noreferrer')
    return setNotification(null)
  }
}

const BidAdded = ({ notification, setNotification }) => {
  const onProceed = () => {
    window.location = '/'
    return setNotification(null)
  }
  return (
    <View >
      <Text>New Bid Added!</Text>
      <Text>{notification.message}</Text>
      <Button title='See Your Offers' onPress={onProceed}/>
    </View>
  )
}

const OfferFinalized = ({ notification, setNotification }) => {
  const onProceed = () => {
    window.location = '/'
    return setNotification(null)
  }
  return (
    <View >
      <Text>Offer Finalised!</Text>
      <Text>{notification.message}</Text>
      <Button title='See Your Offers' onPress={onProceed}>See Your Offers</Button>
    </View>
  )
}
export const OnScreenNotification = ({ notification, setNotification }) => {
  const { type } = notification
  if (type === NOTIFICATION_TYPES.BID_ACCEPTED)
    return (
      <BidAccepted
        notification={notification}
        setNotification={setNotification}
      />
    )
  if (type === NOTIFICATION_TYPES.BID_ADDED)
    return (
      <BidAdded notification={notification} setNotification={setNotification} />
    )
  if (type === NOTIFICATION_TYPES.OFFER_FINALIZED)
    return (
      <OfferFinalized
        notification={notification}
        setNotification={setNotification}
      />
    )
}