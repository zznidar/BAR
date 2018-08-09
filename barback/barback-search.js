// BARback-dev
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');


(async function main() {
	try{

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();
	//page.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G955F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36');
	

	
	await page.emulate(devices['iPhone 6'])
	await page.goto('https://google.com', { waitUntil: 'networkidle0' });
	await page.focus('input[name=q]');
    await page.type('input[name=q]', 'mkk naklo' + (String.fromCharCode(13)), { delay: 10 })
    
    await page.waitFor(2000);
    
    const response = page.click('div.MUxGbd.v0nnCb');
    
    //const chain = response.request().redirectChain();
	page.on('framenavigated', frame => {
	if(frame.parentFrame() === null){
    console.log(frame._url);
	}});
    
    
  //  const list = await page.evaluateHandle(() => {
  //return Array.from(document.getElementById("rso").getElementsByTagName("a")).map(a => a.href);
//});
//console.log(await list.jsonValue());
    
    
    //await document.getElementById("rso").getElementsByTagName("a")[0].click();
    //const linkHandlers = await page.$x("//a[contains(text(), 'Krajevna')]");
//if (linkHandlers.length > 0) {
  //await linkHandlers[0].click();
//} else {
//  throw new Error("Link not found");
//}
    
    //await page.click('//*[@id="dimg_4"]');
    //await page.type(String.fromCharCode(13));
    //searchResult = `div.g:nth-child(${1}) h3 a`;
    //await page.waitFor(searchResult, {visible: true});
    //page.click(searchResult);
    //await page.waitForNavigation();

  

	//console.log(chain.length); // 1
	//var i;
	//for (i = 0; i < chain.length; i++) {
	//	console.log(i + " " + chain[i].url());
	//}
	//console.log(chain[0].url());
	//console.log(chain[1].url());
	//await browser.close();
	setTimeout(() => { browser.close(); }, 10000);
	} catch(e) {
	console.log('Moja napaka.', e);
	}
})();
