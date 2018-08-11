// BARback-dev
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

console.log("User passed a parameter: " + process.argv[2] + "\n"); // process.argv is an array of arguments passed by user

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
console.log("\n");

var domains = [];



(async function main() {
	
	for(i = 2; i < process.argv.length; i++) {
	await test();
	console.log(domains);
	}
	console.log("Finished. Time to dedupe domains and compare to BAR-list.");

	async function test() {
		try{
			const browser = await puppeteer.launch({ headless: false });
			const page = await browser.newPage();
			//page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G955F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36');
			

			
			await page.emulate(devices['iPhone 6'])
			await page.goto('https://google.com', { waitUntil: 'networkidle0' });
			await page.focus('input[name=q]');
			await page.type('input[name=q]', process.argv[i] + (String.fromCharCode(13)), { delay: 10 })
			
			await page.waitFor(2000);
			
			const response = page.click('div.MUxGbd.v0nnCb'); // Click the first result

			page.on('framenavigated', frame => {
			if(frame.parentFrame() === null){
			console.log(frame._url);
			collect(frame._url);
			}});
			
			await page.waitForNavigation({waitUntil: "networkidle0"});
			console.log("Page has loaded and has been idle for 500 ms. Suppose redirects are finished; continue with next query.");
			// We should browser.close() here, but need to test if ad-redirect pages maybe need more than 500 idle ms to redirect.
		} catch(e) {console.log('My error.', e);}

}})();

async function collect(url) {
	console.log("Parsed domain: " + parseDomain(url));
	domains.push(parseDomain(url));
}

function parseDomain(url) {
	return url.split("://")[1].split("/")[0].split("?")[0].split("#")[0];
}