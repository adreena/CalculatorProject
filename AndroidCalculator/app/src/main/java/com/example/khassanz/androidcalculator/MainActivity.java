package com.example.khassanz.androidcalculator;

import android.app.ProgressDialog;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.text.method.ScrollingMovementMethod;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.util.Log;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedOutputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.Buffer;



public class MainActivity extends AppCompatActivity {


    Button btnAdd, btnSub, btnMul, btnDiv;
    Button btn1, btn2, btn3, btn4,btn5;
    Button btn6, btn7, btn8, btn9,btn0;
    Button btnClear, btnMemory, btnDecimal, btnEqual;
    Button btnOpenParanthesis, btnCloseParanthesis, btnBackspace;

    TextView txtResult, txtEquation;

    StringBuilder equation;
    String memory;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //initializing empty equation string and memory
        equation = new StringBuilder();
        memory = "0";

        //wiring view to local variables
        btnAdd = (Button)findViewById(R.id.btnAdd);
        btnSub = (Button)findViewById(R.id.btnSub);
        btnMul = (Button)findViewById(R.id.btnMul);
        btnDiv = (Button)findViewById(R.id.btnDiv);
        btn0 = (Button)findViewById(R.id.btn0);
        btn1 = (Button)findViewById(R.id.btn1);
        btn2 = (Button)findViewById(R.id.btn2);
        btn3 = (Button)findViewById(R.id.btn3);
        btn4 = (Button)findViewById(R.id.btn4);
        btn5 = (Button)findViewById(R.id.btn5);
        btn6 = (Button)findViewById(R.id.btn6);
        btn7 = (Button)findViewById(R.id.btn7);
        btn8 = (Button)findViewById(R.id.btn8);
        btn9 = (Button)findViewById(R.id.btn9);
        btnDecimal = (Button)findViewById(R.id.btnDecimal);
        btnMemory = (Button)findViewById(R.id.btnClearMemory);
        btnClear = (Button)findViewById(R.id.btnClear);
        btnEqual = (Button)findViewById(R.id.btnEqual);
        btnOpenParanthesis = (Button)findViewById(R.id.btnOpenParanthesis);
        btnCloseParanthesis = (Button)findViewById(R.id.btnCloseParanthesis);
        btnBackspace = (Button)findViewById(R.id.btnBackspace);

        txtResult = (TextView)findViewById(R.id.txtResult);
        txtEquation = (TextView)findViewById(R.id.txtEquation);

        txtEquation.setMovementMethod(new ScrollingMovementMethod());

        btnEqual.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //make Post request
                new PostDataTask().execute("http://192.168.1.70:3000/equlator");
            }
        });

        //make Get request to connect to Equlator Server on port 3000
        new GetDataTask().execute("http://192.168.1.70:3000/");
    }

    /* Sending GET Request to Connect to Equltor Server */
    class GetDataTask extends AsyncTask<String, Void, String>{

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected String doInBackground(String... params) {
            try{
                return GetData(params[0]);
            }
            catch(IOException ex){
                return "Netwrok Error Occured!";
            }
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);

            //display connection status to textView
           // txtResult.setText(result);

        }

        private String GetData(String urlPath) throws IOException{
            StringBuilder result = new StringBuilder();
            BufferedReader bufferedReader = null;
            try {
                //initialize and config request/ then connect to server
                URL url = new URL(urlPath);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setReadTimeout(10000 /* miliseconds */);
                urlConnection.setConnectTimeout(10000 /*miliseconds*/);
                urlConnection.setRequestMethod("GET");
                urlConnection.setRequestProperty("Content-Type", "Application/json"); //set Header
                urlConnection.connect();

                //Read data response from server
                InputStream inputStream = urlConnection.getInputStream();
                bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                String line = bufferedReader.readLine();
                /*while((line = bufferedReader.readLine())!=null){
                    result.append(line).append("\n");
                }*/
                result.append(line);
                if(bufferedReader != null)
                    bufferedReader.close();
            }
            finally{
                if(bufferedReader!=null)
                    bufferedReader.close();
            }

            return result.toString();
        }
    }

    /* Sending POST Request to Equltor Server and recieve result */
    class PostDataTask extends AsyncTask<String, Void, String>{
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }

        @Override
        protected String doInBackground(String... params) {
            try{
                return postData(params[0]);
            }catch(IOException ex){
                return "Network Error";
            }catch(JSONException ex){
                return "Data invalid";
            }
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);
            //display result
            txtResult.setText(result);
            equation = new StringBuilder();
            txtEquation.setText("0");
        }

        private String postData(String urlPath) throws IOException,JSONException{

            StringBuilder response = new StringBuilder();
            String result = "";
            BufferedWriter bufferedWriter = null;
            BufferedReader bufferedReader = null;
            try {
                //send equation
                JSONObject dataToSend = new JSONObject();
                dataToSend.put("equation", equation.toString());

                //Initialze and config request, connect to server
                URL url = new URL(urlPath);
                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setReadTimeout(10000 /* miliseconds */);
                urlConnection.setConnectTimeout(10000 /*miliseconds*/);
                urlConnection.setRequestMethod("POST");
                urlConnection.setDoOutput(true); /*enable output {body data} */
                urlConnection.setRequestProperty("Content-Type", "Application/json"); //set Header
                urlConnection.connect();

                OutputStream outputStream = urlConnection.getOutputStream();
                bufferedWriter = new BufferedWriter(new OutputStreamWriter(outputStream));
                bufferedWriter.write(dataToSend.toString());
                bufferedWriter.flush();

                //read data response from server
                InputStream inputStream = urlConnection.getInputStream();
                bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    response.append(line).append("\n");
                }
                //extract result from json response
                JSONObject jsonObject = new JSONObject(response.toString());
                if(jsonObject!=null)
                    result = jsonObject.getString("result");
            }finally{
                if(bufferedWriter !=null)
                    bufferedWriter.close();
                if(bufferedReader != null)
                    bufferedReader.close();
            }

            return result;
        }

    }

    public void onClickButton(View view){
        Button button = (Button) view;
        equation.append(button.getText());
        txtEquation.setText(equation);
    }

    /*Backspace: clear last character of equation*/
    public void onClickBackspace(View view)
    {
        if(equation.length()>0)
        {
            equation.setLength(equation.length() - 1);
            txtEquation.setText(equation.toString());
        }
        if(equation.length()==0)
            txtEquation.setText("0");
    }

    /* C: clear equation */
    public void onClickClear(View view)
    {
        equation = new StringBuilder();
        txtEquation.setText("0");
    }

    /* MC: clear memory */
    public void onClickClearMemory(View view){
        memory = "0";
    }

    /* MS: keep result in memory */
    public void  onClickSaveMemory(View view){
        memory = txtResult.getText().toString();
    }

    /* MR: read memory */
    public void  onClickReadMemory(View view){
        String originalEquation = equation.toString();
        Boolean isAfterOperator = false ;
        int len= originalEquation.length();
        if(len > 0)
        {
            char lastCharacter = originalEquation.charAt(originalEquation.length() - 1);
            if(lastCharacter == '+' || lastCharacter == '*' ||
                    lastCharacter == '/' ||lastCharacter == '-' || lastCharacter == '(') {
                /* is After Operator */
                equation.append(memory);
                txtEquation.setText(equation.toString());
            }
        }
        else{
            if(originalEquation == "0")
                equation.setLength(0);
            equation.append(memory);
            txtEquation.setText(equation.toString());
        }
    }
}
