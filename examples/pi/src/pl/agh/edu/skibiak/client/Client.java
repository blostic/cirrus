package pl.agh.edu.skibiak.client;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.net.UnknownHostException;

import pl.agh.edu.skibiak.utils.PIUtils;

public class Client {

    private String hostname;
    private int port;

    private Socket socketClient;

    public Client(String hostname, int port){
        this.hostname = hostname;
        this.port = port;
    }

    public void connect() throws UnknownHostException, IOException{
        System.out.println("Attempting to connect to " + hostname + ":" + port);
        socketClient = new Socket(hostname, port);
        System.out.println("Connection Established");
    }

    public long readResponse() throws IOException{
        BufferedReader stdIn = new BufferedReader(new InputStreamReader(socketClient.getInputStream()));
        String numberOfElements = stdIn.readLine();
        System.out.println("Response from server:" + numberOfElements);
        return new Long(numberOfElements);
    }

    public void writeResult(Double result) throws IOException{
    	BufferedWriter outWriter = new BufferedWriter(new OutputStreamWriter(socketClient.getOutputStream()));
        System.out.println("Writing to server: " + result);
        outWriter.write(result.toString() + "\n");
        outWriter.flush();
    }

    public static void main(String args[]){
    	String host = "localhost";
    	String port = "9990";
    	
    	String portV = System.getenv("SERVER_PORT_9990_TCP_PORT");
    	String addrV = System.getenv("SERVER_PORT_9990_TCP_ADDR");
    	
    	System.err.println(portV);
    	System.err.println(addrV);
    	if (portV != null && addrV != null && portV != "" && addrV != "") {
    		port = portV;
    		host = addrV;
    	}
    	
        Client client = new Client (host, new Integer(port));
        try {
            client.connect();
            long numberOfThrows = client.readResponse();
            double result = PIUtils.computePI(numberOfThrows);
            client.writeResult(result);
        } catch (UnknownHostException e) {
            System.err.println("Host unknown. Cannot establish connection");
        } catch (IOException e) {
            System.err.println("Cannot establish connection. Server may not be up."+e.getMessage());
        }
    }
    
}