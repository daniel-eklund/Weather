const puppeteer = require('puppeteer');
const { url } = require('inspector');
let myArgs = process.argv.slice(2)
var plotly = require('plotly')("10611783", "761UFgKnR32hfxgBnXHd")
var yearsAmt = 10;
//year-month-day

//let dateInput = myArgs[0] + "-" + myArgs[1] + "-" + myArgs[2] 
let md = "-" + myArgs[1] + "-" + myArgs[2];
var year = myArgs[0];
const Enum = 5
var diskPath = myArgs[3]
if (diskPath === null) diskPath = "C:/"

var allReg = []

if (year === null) {
    //load default data from last 10 years
    var high = [
        '95',  '96',  '90',
        '103', '102', '83',
        '104', '99',  '96',
        '93'
      ]
    var low = [
        '74', '75', '67',
        '74', '75', '57',
        '73', '66', '69',
        '60'
      ]
    var avg = [
        '83.96', '86.08',
        '79.13', '88.58',
        '88.71', '71.21',
        '89.04', '84.57',
        '83.56', '78.48'
      ]
} else {
    main()
}

async function main(){
    //init
    const browser = await puppeteer.launch()
    let homeURL = 'https://www.wunderground.com/history/daily/us/ut/salt-lake-city/KSLC/date/'
    
    let urls = new Array(yearsAmt)
    
    for (let i = 0; i < urls.length; i++) {
        let tempY = year-(i+1);
        urls[i] = homeURL + tempY.toString() + md;
        //console.log(urls[i])
    }

    for (const url of urls) {
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle2'});
        
        let day = await page.evaluate(() => {
        //all changes table need to be done here and you can not output here 

            var table = document.querySelectorAll('tbody')[1]
            let rows = table.rows

            let data = []
            
            for (const row of rows) {
                data.push(row.childNodes[1].innerText)
            }

            return(data)
        })
        
        high.push(day[0])
        low.push(day[1])
        avg.push(day[2])

    }
    //console.log(high)
    //console.log(low)
    //console.log(avg)
    await browser.close();
}

function pEvent(inA, type) {
    console.log("------------------------------")
    //find max and min of high temps
    //range +-2
    let min = Math.min(...inA)-2
    let max = Math.max(...inA)+2
    let step = (max - min)/Enum;

    let events = []
    for (let i=min+step; i<max+step; i+=step) {
        //load each event
        //event is range of:
        //temp-step <--> temp+step
        //with left side alignment
        events.push(i)
    }
    //console.log(events)
    //find all values in data that fall into each event range
    let l = events.length
    let pEvents = new Array(l).fill(0)
    //console.log(pEvents)

    inA.forEach(temp => {
        for (let i=0; i<events.length-1; i++) {
            //check within range
            if (events[i] <= temp && temp < events[i+1]) {
                //console.log(events[i] + " : " + temp)
                //check index of temp
                let ix = events.indexOf(events[i])
                //console.log(ix)
                pEvents[ix]++;
            }
        }
    }); 
    //console.log(type + ":")
    //console.log(pEvents)
    let num = low.length - 1
    pEvents = pEvents.map(function(x) { return (x / num).toFixed(2); });
    //console.log(pEvents);

    var data = [{x:events, y:pEvents, type: 'bar'}];

    var layout = {title: type, xaxis: {title: "Event", showgrid: true}, yaxis: {title: "P(Event)", showline: true}}
    var graphOptions = {layout: layout, fileopt : "overwrite", filename : type};

    plotly.plot(data, graphOptions, function (err, msg) {
        if (err) return console.log(err);
        //console.log(msg);
        //console.log(msg.url)
        s_shot(msg.url, type + "_bar.png")
    });


}

//code used from:
//https://stackoverflow.com/questions/14226803/wait-5-seconds-before-executing-next-line/28173606
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
}

//code borrowed from:
//https://dev.to/benjaminmock/how-to-take-a-screenshot-of-a-page-with-javascript-1e7c
const s_shot = async (url, tpath) => {
    // open the browser and prepare a page

    //console.log(url)
    url = url + ".embed"

    const browser = await puppeteer.launch()
    const page = await browser.newPage()
  
    await page.setViewport({
        width: 1280,
        height: 1000
    })

    tpath = 'C:/Users/User/Desktop/' + tpath

    //console.log(url)
    //console.log(tpath)
    
    await page.goto(url)
    wait(6000);
    await page.screenshot({
        path: tpath,
        fullPage: true
    })
  
    // close the browser 
    await browser.close();
    console.log("Screenshot of " + url + " completed")
};

function sumA(inA) {
    let total = 0
    inA.forEach(data => {
        total += parseFloat(data)
        //console.log(data + " : " + total)
    });
    return total
}

function sumAB(inA, inB) {
    let total = 0
    for (let i=0; i<inA.length; i++) {
        total += (parseFloat(inA[i]) * parseFloat(inB[i]))
    }
    return total
}

function calcLinear(xArr, yArr) {
    //xArr = [43, 21, 25, 42, 57, 59]
    //yArr = [99, 65, 79, 75, 87, 81]

    let Ex = sumA(xArr)
    //console.log("Ex: " + Ex)
    let Ey = sumA(yArr)
    //console.log("Ey: " + Ey)
    let Exy = sumAB(xArr, yArr)
    //console.log("Exy: " + Exy)
    let Ex2 = sumAB(xArr, xArr)
    //console.log("Ex2: " + Ex2)
    //let Ey2 = sumAB(yArr, yArr)
    
    let n = xArr.length
    //console.log(n)
    let a = ((Ey * Ex2) - (Ex * Exy)) / ((n * Ex2) - (Ex * Ex))
    let b = ((n * Exy) - (Ex * Ey)) / ((n * Ex2) - (Ex * Ex))
    //console.log("a: " + a)
    //console.log("b: " + b)
    return [a,b]
}

function scatter(inA, type) {
    //create x-data (years)
    let years = new Array(yearsAmt)
    for (let i = 0; i < years.length; i++) {
        let tempY = year-(i+1);
        years[i] = tempY.toString()
        //console.log(years[i])
    }

    //figure out linear regression!
    let ab = calcLinear(years, inA)
    allReg.push(ab)
    //console.log("ab: " + ab)

    let y1 = ab[0] + (ab[1] * years[0])
    let y2 = ab[0] + (ab[1] * years[years.length - 1])

    //console.log("y1: " + y1)
    //console.log("y2: " + y2)

    //first and last of years
    let lx = [years[0], years[years.length - 1]]
    //let ly = [inA[0], inA[inA.length - 1]]
    let ly = [y1, y2]

    //console.log("lx: " + lx)
    //console.log("ly: " + ly)

    //using equations found on:
    //https://www.statisticshowto.com/probability-and-statistics/regression-analysis/find-a-linear-regression-equation/
    //for linear regression
    
    
    
    var data = [{"name":"data", x:years, y:inA, type: 'scatter'}, {"name":"linear-regression", x:lx, y:ly, type: "scatter"}];
    var layout = {title: type, xaxis: {title: "Temperature"}, yaxis: {title: "Year"}}
    var graphOptions = {layout: layout, fileopt : "overwrite", filename : type};


    plotly.plot(data, graphOptions, function (err, msg) {
        if (err) return console.log(err);
        s_shot(msg.url, type + "_scatter.png")
    });
    
}

//Probability - bar graphs
pEvent(high, "High_B")
pEvent(low, "Low_B")
pEvent(avg, "Avg_B")

//Lin-regression - scatter plots
scatter(high, "High_S")
scatter(low, "Low_S")
scatter(avg, "Avg_S")

//console.log(allReg)
/*
Todos:
-------------------------------------
Check for errors in data load
    -Throw/catch on errors 
Initial menu
Range of error
    -based on existing data
    -check different amounts of data points
Final output
Prediction
Linear regression "guess" for future years
*/