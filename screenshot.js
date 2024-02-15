const puppeteer = require('puppeteer');

const urls = [
  'https://attio.com/',
  'https://www.june.so/',
  'https://www.spendesk.com/en-eu/'
];

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}


// Set defaults for viewport and captureType
const viewPort = process.argv[2] || 'desktop'; // Defaults to 'desktop' if not specified
const captureType = process.argv[3] || 'hero'; // Defaults to 'hero' if not specified

async function takeScreenshot(urls, viewPort, captureType) {
  const browser = await puppeteer.launch();
  
  for (let siteUrl of urls) {
    const domainName = new URL(siteUrl).hostname.replace(/www\./i, '');
    const page = await browser.newPage();

    // Configure viewport
    if (viewPort === 'desktop') {
      await page.setViewport({ width: 1280, height: 800 });
    } else { // Assumes mobile if not desktop
      await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 3, isMobile: true, hasTouch: true, isLandscape: false });
    }

    await page.goto(siteUrl, {waitUntil: 'networkidle2'});

    // Configure screenshot type
    if (captureType === 'fullPage') {
      await autoScroll(page); // Include the autoScroll function
      await page.screenshot({path: `${domainName}-${viewPort}-fullPage.png`, fullPage: true});
    } else { // Assumes hero if not fullPage
      await page.screenshot({path: `${domainName}-${viewPort}-hero.png`});
    }
    
    console.log(`Screenshot taken for ${domainName}: ${viewPort}, ${captureType}`);
  }

  await browser.close();
}

takeScreenshot(urls, viewPort, captureType);