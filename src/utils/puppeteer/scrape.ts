import puppeteer from 'puppeteer';

export async function scrapeWebsite(url: string) {
  try {
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log("Page loaded");

    const aboutUsLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const aboutLink = links.find(link => 
        /about|who we are|our story|company info/i.test(link.innerText)
      );
      return aboutLink ? aboutLink.href : null;
    });

    console.log("About Us Link:", aboutUsLink);

    if (aboutUsLink) {
      if (!aboutUsLink.startsWith("http")) {
        const newUrl = new URL(aboutUsLink, url).href;
        await page.goto(newUrl, { waitUntil: 'domcontentloaded' });
      } else {
        await page.goto(aboutUsLink, { waitUntil: 'domcontentloaded' });
      }
      
      await page.waitForSelector("body"); 
      const aboutContent = await page.evaluate(() => document.body.innerText);
      await browser.close();
      return aboutContent;
    } else {
      console.log("No About Us page found, scraping homepage.");
      await page.waitForSelector("body");
      const homepageContent = await page.evaluate(() => document.body.innerText);
      await browser.close();
      return homepageContent;
    }
  } catch (error) {
    console.error("Error in scrapeWebsite:", error);
    throw error;
  }
}
