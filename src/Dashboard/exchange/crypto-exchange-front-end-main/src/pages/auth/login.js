import { LoadingButton } from '@mui/lab'
import { TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useSearchParams } from 'react-router-dom'
import { login, verifyLoginOtp } from '../../api'
import { StyleSheet, Text, TouchableOpacity, View} from "react-native";

export const LoginView = (props) => {
  const [formContent, setFormContent] = useState({ phoneNumber: '', otp: '' })
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (searchParams) {
      const phoneNumber = searchParams.get('phone')
      if (phoneNumber) {
        setFormContent({ ...formContent, phoneNumber: phoneNumber })
        setIsOtpSent(true)
      }
    }
  }, [searchParams])

  const handleChange = (event, phone = null) => {
    const newState = { ...formContent }
    newState[event.target.name] = phone || event.target.value
    setFormContent(newState)
  }

  const submitPhoneNumber = async () => {
    try {
      const { phoneNumber } = formContent
      if (!phoneNumber) throw new Error('Phone number is required')

      setIsSubmitting(true)
      console.log(phoneNumber)
      const { err } = await login({ phoneNumber: `+${phoneNumber}` })
      if (err) throw new Error(`${err.status}: ${err.message}`)

      setMessage('OTP is sent')
      setIsOtpSent(true)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitOtp = async () => {
    try {
      setIsSubmitting(true)
      const { phoneNumber, otp } = formContent
      if (!phoneNumber) throw new Error('Phone number is required')
      if (!otp) throw new Error('OTP is required')
      console.log(formContent)

      const { err } = await verifyLoginOtp({
        phoneNumber: `+${phoneNumber}`,
        otp,
      })
      if (err) throw new Error(`${err.status}: ${err.message}`)

      window.location = '/'
    } catch (err) {
      setMessage(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View >
      <Text>Login Here</Text>
      
      <Text>{message}</Text>
      <View >
        {isOtpSent ? (
          <>
            <View >
              {' '}
              Your phone number: {formContent.phoneNumber}
            </View>
            <View>
              <TextField
                id="outlined-basic"
                label="OTP Here"
                variant="outlined"
                name="otp"
                onChange={handleChange}
                value={formContent.otp}
                type="number"
              />
            </View>
            <View >
              <LoadingButton
                onClick={submitOtp}
                variant="contained"
                loading={isSubmitting}
              >
                Submit OTP
              </LoadingButton>
            </View>
            <View >
              <LoadingButton onClick={submitPhoneNumber} loading={isSubmitting}>
                Resend OTP
              </LoadingButton>
            </View>
          </>
        ) : (
          <>
            <View >
              <PhoneInput
                country={'us'}
                inputProps={{ name: 'phoneNumber' }}
                countryCodeEditable={true}
                value={formContent.phoneNumber}
                onChange={(phone, data, event) => handleChange(event, phone)}
                placeholder="Enter your phone number"
                disabled={false}
              />
            </View>
            <View className="col">
              {}
              <LoadingButton
                onClick={submitPhoneNumber}
                variant="contained"
                loading={isSubmitting}
              >
                Get OTP
              </LoadingButton>
            </View>
          </>
        )}
      </View>
      <View >
        <Text>

        If you don't have an account
        </Text>
        <TouchableOpacity onPress={()=>{

        }}>
          <Text>
          sign up here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
