package com.example.khassanz.androidcalculator;

import android.app.ProgressDialog;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.Buffer;


public class MainActivity extends AppCompatActivity {


    Button btnConnect;
    TextView txtStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //wiring view to local variables
        btnConnect = (Button)findViewById(R.id.buttonConnect);
        txtStatus =(TextView)findViewById(R.id.txtViewstatus);

        btnConnect.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String status = txtStatus.getText().toString();

                txtStatus.setText("connected!");
            }
        });

        //make Get request
        new GetDataTask().execute("http://192.168.1.70:3000");
    }

    class GetDataTask extends AsyncTask<String, Void, String>{

        ProgressDialog progressDialog ;

        @Override
        protected void onPreExecute() {

            super.onPreExecute();
            progressDialog = new ProgressDialog(MainActivity.this);
            progressDialog.setMessage("Loading data ...");
            progressDialog.show();
        }

        @Override
        protected String doInBackground(String... params) {

            StringBuilder result = new StringBuilder();

            try{
                //initialize and config request/ then connect to server
                URL url = new URL(params[0]);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setReadTimeout(10000 /* miliseconds */);
                urlConnection.setConnectTimeout(10000 /*miliseconds*/);
                urlConnection.setRequestMethod("GET");
                urlConnection.setRequestProperty("Content-Type", "text/plain"); //set Header
                urlConnection.connect();

                //Read data response from server
                InputStream inputStream = urlConnection.getInputStream();
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                String line;
                while((line = bufferedReader.readLine())!=null){
                    result.append(line).append("\n");
                }


            }catch(IOException ex){
                return "Netwrok Error Occured!";

            }


            return result.toString();
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);

            //set data to textView
            txtStatus.setText(result);

            //cancel progress
            if(progressDialog != null){
                progressDialog.dismiss();
            }
        }
    }

}
