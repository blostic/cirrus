package pl.agh.edu.skibiak.server;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Server {
    
    private final class RunnableImplementation implements Runnable {
		
    	private Socket client;
    	
		public RunnableImplementation(Socket client) {
			this.client = client;
    	}

		public void run() {
			try {
				sendComputation(client, ELEMENTS_PER_NODE);
				results.add(getResult(client));
				client.close();
			} catch (IOException e) {
				e.printStackTrace();
			}					
		}

		private void sendComputation(Socket client, Long numberOfComputations) throws IOException {
		    BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(client.getOutputStream()));
		    System.out.println("Seding message: " + numberOfComputations);
		    writer.write(numberOfComputations.toString() + "\n");
		    writer.flush();
		}

		private double getResult(Socket client) throws IOException {
			BufferedReader stdIn = new BufferedReader(new InputStreamReader(client.getInputStream()));
			String result = stdIn.readLine();
		    System.out.println("Result from client: " + result);
		    return new Double(result);
		}
	}

	private ServerSocket serverSocket;
    private int port;
    private volatile List<Double> results = new CopyOnWriteArrayList<Double>();
	private long numberOfElements;
	private long ELEMENTS_PER_NODE = 100000000l;
    
	public Server(int port, long numberOfElements) {
        this.port = port;
		this.numberOfElements = numberOfElements;
    }
    
    public void start() throws IOException {
        System.out.println("Starting the socket server at port:" + port);
        serverSocket = new ServerSocket(port);
        
        while(results.size() < numberOfElements / ELEMENTS_PER_NODE + 1) {
        	System.out.println("Waiting for clients...");
        	Socket client = serverSocket.accept();
        	Runnable runnable = new RunnableImplementation(client);
			new Thread(runnable).start();
        }
        Double sum = 0.0;
        for (Double result : results){
        	sum += result;
        }
        System.err.println(sum/results.size());
    }
    
    public static void main(String[] args) {
    	String port = "9990";
    	if (args.length > 1) {
    		port = args[0];
    	}
    	int portNumber = new Integer(port);
        
        try {
            Server socketServer = new Server(portNumber, 1000000000l);
            socketServer.start();
            } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
