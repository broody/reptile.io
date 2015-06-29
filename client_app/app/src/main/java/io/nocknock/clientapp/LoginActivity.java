package io.nocknock.clientapp;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;


public class LoginActivity extends ActionBarActivity {
    private static final String TAG = "Login";
    private Button mLogin;
    private Button mRegister;
    private TextView mUsername;
    private TextView mPassword;
    private Context mContext;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        mContext = this;

        mLogin = (Button) findViewById(R.id.login);
        mRegister = (Button) findViewById(R.id.register);
        mUsername = (TextView) findViewById(R.id.username);
        mPassword = (TextView) findViewById(R.id.password);

        mLogin.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                mLogin.setEnabled(false);
                SendPostReqAsyncTask task = new SendPostReqAsyncTask();
                task.execute(mUsername.getText().toString(), mPassword.getText().toString());
            }
        });

        mRegister.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {

            }
        });
    }


    private class SendPostReqAsyncTask extends AsyncTask<String, Void, String> {

        private ProgressDialog loading;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            loading = ProgressDialog.show(mContext, "Logging in", "", true);
        }

        @Override
        protected String doInBackground(String... params) {
            String url = getString(R.string.server_url) + "login";
            Log.d(TAG,"Executing post: " + url);
            Log.d(TAG, "Username: " + params[0]);

            try {
                HttpClient client = new DefaultHttpClient();
                HttpPost post = new HttpPost(url);


                JSONObject jsonData = new JSONObject();
                jsonData.put("username", params[0]);
                jsonData.put("password", params[1]);

                StringEntity se = new StringEntity(jsonData.toString());

                post.setEntity(se);
                post.setHeader("Accept", "application/json");
                post.setHeader("Content-type", "application/json");

                HttpResponse reponse = client.execute(post);

                InputStream inputStream = reponse.getEntity().getContent();
                InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
                BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
                StringBuilder stringBuilder = new StringBuilder();
                String bufferedStrChunk = null;
                while((bufferedStrChunk = bufferedReader.readLine()) != null){
                    stringBuilder.append(bufferedStrChunk);
                }

                return stringBuilder.toString();

            } catch (Exception e) {
                Log.e(TAG, e.toString());
            }

            return null;
        }

        @Override
        protected void onPostExecute(String response) {
            super.onPostExecute(response);
            loading.dismiss();

            try {

                JSONObject jsonRes = new JSONObject(response);
                String result = jsonRes.getString("result");
                String message = jsonRes.getString("message");

                if(result.contains("failure")) {
                    Toast.makeText(mContext, "Login failure: " + message, Toast.LENGTH_SHORT).show();
                    mLogin.setEnabled(true);
                } else {
                    finishLogin();
                }

            } catch (Exception e) {

            }

        }
    }

    private void finishLogin() {
        this.finish();
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_login, menu);
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
