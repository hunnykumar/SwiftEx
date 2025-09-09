package com.app.swiftEx.app

import android.util.Base64
import com.facebook.react.bridge.*
import com.google.android.play.core.integrity.IntegrityManagerFactory
import com.google.android.play.core.integrity.IntegrityTokenRequest
import java.security.SecureRandom

class PlayIntegrityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PlayIntegrity"

    @ReactMethod
    fun getIntegrityToken(promise: Promise) {
        val context = reactApplicationContext
        val integrityManager = IntegrityManagerFactory.create(context)

        val nonce = generateNonce()

        val request = IntegrityTokenRequest.builder()
            .setNonce(nonce)
            .build()

        integrityManager.requestIntegrityToken(request)
            .addOnSuccessListener { response ->
                val token = response.token()
                promise.resolve(token)
            }
            .addOnFailureListener { e ->
                promise.reject("INTEGRITY_ERROR", e.message, e)
            }
    }

    private fun generateNonce(): String {
        val random = ByteArray(24)
        SecureRandom().nextBytes(random)
        return Base64.encodeToString(random, Base64.URL_SAFE or Base64.NO_WRAP or Base64.NO_PADDING)
    }
}
