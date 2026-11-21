package com.amazonclone

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "AmazonClone"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun getLaunchOptions(): Bundle? {
          val bundle = Bundle()
          intent.getStringExtra("visualScreen")?.let { bundle.putString("visualScreen", it) }
          if (intent.getBooleanExtra("visualTest", false)) {
            bundle.putBoolean("visualTest", true)
          }
          if (intent.getBooleanExtra("e2eForceCartFailure", false)) {
            bundle.putBoolean("e2eForceCartFailure", true)
          }
          return if (bundle.isEmpty) null else bundle
        }
      }
}