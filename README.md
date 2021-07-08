# Weather
This program scrapes past weather data from a database, and plots the trends along with
a prediction on what the weather will be for that date in the future.


Guide to setup and running weather.js
In the future will package the program to be ran out of the box, (no install neccesary)

1. Install node.js and npm using installation guide:
	https://phoenixnap.com/kb/install-node-js-npm-on-windows	

2. Install puppeteer library and plotly library using command line:
	npm install puppeteer
	npm install plotly

3. Run program from command line:
	node weather.js [args]
	
	args is a argument list of:
	year month day path
	
	-path is where screenshots will be saved.
	
	example: 
	node weather.js 2021 6 30 C:/Users/User/Desktop
	
	if no arguments given:
		-loads default data (last 10 years; 2009-2019)
		-save path will be C:/
	
4. Check out graphs saved to path given

5. If screenshot of graph is empty, (means slow internet connection) and need to work out async timings
