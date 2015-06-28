package io.nocknock.clientapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.hardware.Camera;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;


public class MainActivity extends ActionBarActivity {
    private static final String TAG = "clientapp";
    private Camera mCamera = null;
    private CameraPreview mPreview;
    private SenderThread mSender;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Get preferences
        SharedPreferences sharedPref = this.getSharedPreferences(
                getString(R.string.pref_key), Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPref.edit();

        boolean isRegistered = sharedPref.getBoolean(getString(R.string.pref_is_register), false);

        if(!isRegistered) {
            Intent intent = new Intent(this, LoginActivity.class);
            startActivityForResult(intent, 0);
            return;
        }

        // Create an instance of Camera
        mCamera = getCameraInstance();
        mPreview = new CameraPreview(this, mCamera);

        FrameLayout preview = (FrameLayout) findViewById(R.id.camera_preview);
        preview.addView(mPreview);

        // Add a listener to the Capture button
        Button captureButton = (Button) findViewById(R.id.button_capture);
        captureButton.setOnClickListener(
                new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        // get an image from the camera
                        mCamera.takePicture(null, null, mPicture);
                    }
                }
        );

        // Start sender thread;
        mSender = new SenderThread();
        mSender.start();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if(mCamera != null)
            mCamera.release();
    }

    private class SenderThread extends Thread {
        private boolean running = true;
        @Override
        public void run() {
            while(running) {
                try {
                    Thread.sleep(1000);
                    Log.d(TAG,"My stuff!");
                } catch (Exception e) {

                }
            }
        }

        public void kill() {
            running = false;
        }
    }

    private Camera.PictureCallback mPicture = new Camera.PictureCallback() {
        @Override
        public void onPictureTaken(byte[] data, Camera camera) {
            Log.d(TAG,"GOT THE PICTURE! " + data.length);
            mCamera.startPreview();
        }
    };

    private static Camera getCameraInstance() {
        Camera c = null;
        try {
            c = Camera.open();
        } catch (Exception e) {

        }
        return c;
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
