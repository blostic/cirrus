package pl.agh.edu.skibiak.utils;

import java.util.Random;

public class PIUtils{  

	private static boolean isInside (double xPos, double yPos)	
	{   
		double distance = Math.sqrt((xPos * xPos) + (yPos * yPos));
		return (distance < 1.0);
	}
	
	public static double computePI (long numThrows)
	{  
		Random randomGen = new Random (System.currentTimeMillis());		
		int hits = 0;
		double PI = 0;		
		
		for (int i = 1; i <= numThrows; i++)
		{  
			double xPos = (randomGen.nextDouble()) * 2 - 1.0;
			double yPos = (randomGen.nextDouble()) * 2 - 1.0;
			if (isInside(xPos, yPos))
			{
				hits++;
			}
		}

		double dthrows = numThrows;

		PI = (4.0 * (hits/dthrows));

		return PI;
	}

}
