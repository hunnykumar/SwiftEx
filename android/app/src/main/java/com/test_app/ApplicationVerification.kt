package com.app.swiftEx.app

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import java.io.IOException
import android.content.Context
import android.content.Intent
import android.util.Base64
import android.util.Log
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest
import java.security.SecureRandom
import org.json.JSONObject

class ApplicationVerification {

    companion object {
        fun run(context: Context) {
            val integrityManager = IntegrityManagerFactory.create(context)
            val nonce = generateNonceStatic()

            val request = IntegrityTokenRequest.builder()
                .setNonce(nonce)
                .build()

            integrityManager.requestIntegrityToken(request)
                .addOnSuccessListener { response ->
                    val token = response.token()
                    Log.d("PlayIntegrity", "Token on launch: $token")
                    sendToBackend(token) { isValid ->
                        if (!isValid) {
                            val intent = Intent(context, ApplicationValidationFailUI::class.java)
                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                            context.startActivity(intent)
                        } else {
                            // Continue with JS load if valid
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("PlayIntegrity", "Integrity check failed at launch", e)
                    val intent = Intent(context, ApplicationValidationFailUI::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    context.startActivity(intent)
                }
        }

        private fun generateNonceStatic(): String {
            val random = ByteArray(24)
            SecureRandom().nextBytes(random)
            return Base64.encodeToString(random, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
        }

        // application vaidation
        private fun sendToBackend(token: String, resultCallback: (Boolean) -> Unit) {
            val client = OkHttpClient()
            val json = """{ "integrityToken": "$token" }"""
            val body = RequestBody.create("application/json".toMediaTypeOrNull(), json)

            val request = Request.Builder()
                .url("https://swiftexchange.io/api/verify-token")
                .post(body)
                .build()

            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    Log.e("PlayIntegrity", "Backend call failed", e)
                    resultCallback(false)
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseString = response.body?.string()
                    try {
                        val jsonResponse = JSONObject(responseString ?: "{}")
                        val verified = jsonResponse.optBoolean("verified", false)

                        val raw = jsonResponse.optJSONObject("raw")
                        val tokenPayload = raw?.optJSONObject("tokenPayloadExternal")

                        val appRecognition = tokenPayload
                            ?.optJSONObject("appIntegrity")
                            ?.optString("appRecognitionVerdict", "")

                        val deviceRecognitionList = tokenPayload
                            ?.optJSONObject("deviceIntegrity")
                            ?.optJSONArray("deviceRecognitionVerdict")

                        var hasDeviceIntegrity = false
                        if (deviceRecognitionList != null) {
                            for (i in 0 until deviceRecognitionList.length()) {
                                if (deviceRecognitionList.getString(i) == "MEETS_DEVICE_INTEGRITY") {
                                    hasDeviceIntegrity = true
                                    break
                                }
                            }
                        }

                        val isValid = verified &&
                                appRecognition == "PLAY_RECOGNIZED" &&
                                hasDeviceIntegrity

                        Log.d("PlayIntegrity", "App valid: $isValid")
                        resultCallback(isValid)
                    } catch (e: Exception) {
                        Log.e("PlayIntegrity", "Error parsing backend response", e)
                        resultCallback(false)
                    }
                }
            })
        }
    }
}
