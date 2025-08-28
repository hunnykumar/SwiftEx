package com.app.swiftEx.app

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class ApplicationValidationFailUI : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Set content view (use the custom layout for the error screen)
        setContentView(R.layout.app_validation_faild)

        // OK button to close the app
        val okButton: Button = findViewById(R.id.ok_button)
        okButton.setOnClickListener {
            moveTaskToBack(true)
        }
    }
}
