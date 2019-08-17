/* Usage: 
start cmd /k node barback-search.js "query 1" "whitelisted domain 1" "query 2" "whitelisted domain 2" "query 3 ..." "whitelisted domain 3 ..."
*/

/* Recommended form of an example query:
	"site:example.com \"example.com\""
*/

// BARback-dev
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const fetch = require('node-fetch'); // Needed to GET the BAR from GitHub (npm install node-fetch)

console.log("User passed a parameter: " + process.argv[2] + "\n"); // process.argv is an array of arguments passed by user

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
console.log("\n");

var domains = [];
var urls = []; // Full URLs, help us to manually visit redirects and find new domains
var counter = 0; // Counts redirects
var lastCounter = 0; // Used to detect new redirects
var timeoutRedirect = 3000; // Should default to 30000 ms (as 30000 ms is the default browser timeout); we shorten it for more speed for dev purposes

var oldList = []; // Deduplicated later on, comments removed
var addList = []; // Domains to be added

var whitelist = ["chromewebdata"]; // Target domains specified by user, not to be put onto BAR; we also whitelist chromewebdata which is shown when page is not found


for(var i = 3; i < process.argv.length; i+=2) {
	whitelist.push(process.argv[i]);
}
console.log("Whitelist: ", whitelist);

var repetitions = 10; // Number of times to re-run the script prior to deduping and outputing results. NOTE: that many scripts run simultaneously. Opening 33 Chromium instances is a regretful idea.
var currentRepetition = 0; // Which repetition runs

(async function main() {
	
	for(i = 2; i < process.argv.length; i+=2) {
	await test();
	console.log(domains);
	}

	console.log("\n");
	
	timerId = setInterval(checkIdle, timeoutRedirect); // Start the timer to regularily check for idle state
	


	async function test() {
		for(currentRepetition; currentRepetition < repetitions; currentRepetition++) {
			try{
				const browser = await puppeteer.launch({ headless: false });
				const page = await browser.newPage();
				//page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G955F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36');
				

				
				await page.emulate(devices[10 + currentRepetition%11]) //Pixel 2, iPad Pro // We start at 10 to avoid old-fashioned devices with old Google design; we modulo 11 not to run out of devices
				await page.goto('https://google.com', { waitUntil: 'networkidle0' });
				await page.focus('input[name=q]');
				await page.type('input[name=q]', process.argv[i] + (String.fromCharCode(13)), { delay: 10 })
				
				
				page.once('load', () => {
					console.log('Search results loaded!'); 
					const response = page.click('div.MUxGbd.v0nnCb'); // Click the first result
					});


				page.on('framenavigated', frame => {
					if(frame.parentFrame() === null){
						console.log(frame._url);
						collect(frame._url);
						counter++;
				}});
				

			} catch(e) {console.log("Barback's error. Spilt some milk, probably. It's no use crying over it.", e);}
		}

}})();

async function collect(url) {
	urls.push(url);
	console.log("Parsed domain: " + parseDomain(url));
	domains.push(parseDomain(url));
}

function parseDomain(url) {
	return url.split("://")[1].split("/")[0].split("?")[0].split("#")[0];
}


async function checkIdle() {
	console.log(timeoutRedirect);
	if((counter == lastCounter) && counter != 0) {
		console.log("No page redirects within last " + (timeoutRedirect/1000) + " seconds!");
		clearInterval(timerId);
		
		console.log(domains);
		
		console.log("Finished. Time to dedupe domains and compare to BAR-list.\n");
		domains.forEach(function (val, array) {
			console.log(val);
		});
		dSet = dedupe(domains);
		console.log(dSet);
		
		urls = dedupe(urls);
		console.log("\n\n********************\nFull URLs we've been redirected to (they may be used for future testing): \n");
		console.log("# " + new Date().toISOString().split("T")[0]);
		for(var i = 0; i < urls.length; i++) {
			console.log(urls[i]);
		}
		console.log("\n");
		
		await compareBAR();
		
	}
	else {
		console.log((counter - lastCounter) + " new redirects.");
		lastCounter = counter;
	}
}

function dedupe(arr) {
	return [...new Set(arr)];
}

async function compareBAR() {
	await fetch('https://raw.githubusercontent.com/zznidar/BAR/master/BAR-list')
    .then(res => res.text())
    .then(body => {
		//console.log(body);
		oldList = [...new Set(body.split("\n").filter(a => a.split("#")[0] != ""))];
		//console.log(oldList);
	})
	.catch(err => console.error(err));
	
	
	addList = dSet.filter(d => oldList.indexOf(d) == -1).filter(w => whitelist.indexOf(w) == -1);
	//console.log(addList);
	
	console.log("\n********************\nThis is to be added to the BAR: \n\n");
	console.log("# " + new Date().toISOString().split("T")[0]);
	for(var i = 0; i < addList.length; i++) {
		console.log(addList[i]);
	}
	
}