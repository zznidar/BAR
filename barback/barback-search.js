// BARback-dev
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const fetch = require('node-fetch');

console.log("User passed a parameter: " + process.argv[2] + "\n"); // process.argv is an array of arguments passed by user

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
console.log("\n");

var domains = [];
var counter = 0;
var lastCounter = 0;
var timeoutRedirect = 3000;

var oldList = []; // Deduplicated later on, comments removed
var addList = []; // Domains to be added


(async function main() {
	
	for(i = 2; i < process.argv.length; i++) {
	await test();
	console.log(domains);
	}

	console.log("\n");

	async function test() {
		try{
			const browser = await puppeteer.launch({ headless: false });
			const page = await browser.newPage();
			//page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G955F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36');
			

			
			await page.emulate(devices['iPhone 6'])
			await page.goto('https://google.com', { waitUntil: 'networkidle0' });
			await page.focus('input[name=q]');
			await page.type('input[name=q]', process.argv[i] + (String.fromCharCode(13)), { delay: 10 })
			
			
			page.once('load', () => {
				console.log('Search results loaded!'); 
				timerId = setInterval(checkIdle, timeoutRedirect); 
				const response = page.click('div.MUxGbd.v0nnCb'); // Click the first result
				});

			//await page.waitFor(2000);
			//await page.waitForNavigation({waitUntil: "networkidle0"});
			
			//timerId = setInterval(checkIdle, timeoutRedirect);
			//const response = page.click('div.MUxGbd.v0nnCb'); // Click the first result

			page.on('framenavigated', frame => {
				if(frame.parentFrame() === null){
					console.log(frame._url);
					collect(frame._url);
					counter++;
			}});
			
			//await page.waitForNavigation({waitUntil: "networkidle0"});
			//console.log("Page has loaded and has been idle for 500 ms. Suppose redirects are finished; continue with next query.");
			// We should browser.close() here, but need to test if ad-redirect pages maybe need more than 500 idle ms to redirect.
			//browser.close();
		} catch(e) {console.log('My error.', e);}

}})();

async function collect(url) {
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
		//console.log("Page has loaded and has been idle for 500 ms. Suppose redirects are finished; continue with next query.");
		clearInterval(timerId);
		
		console.log(domains);
		console.log("Finished. Time to dedupe domains and compare to BAR-list.\n");
		domains.forEach(function (val, array) {
			console.log(val);
		});
		dSet = dedupe(domains);
		console.log(dSet);
		
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
	// GET https://raw.githubusercontent.com/zznidar/BAR/master/BAR-list
	// Parse (split \n into a new set, ignore # (in case we keep the current syntax))
	// Create new set
	
	await fetch('https://raw.githubusercontent.com/zznidar/BAR/master/BAR-list')
    .then(res => res.text())
    .then(body => {
		console.log(body);
		oldList = [...new Set(body.split("\n").filter(a => a.split("#")[0] != ""))];
		console.log(oldList);
	})
	.catch(err => console.error(err));
	
	console.log("Tole je test");
	
	
	addList = dSet.filter(d => oldList.indexOf(d) == -1);
	console.log(addList);
	
	console.log("\n********************\nThis is to be added to the BAR: \n\n");
	console.log(new Date().toISOString().split("T")[0]);
	for(var i = 0; i < addList.length; i++) {
		console.log(addList[i]);
	}
	
}