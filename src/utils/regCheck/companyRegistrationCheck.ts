import puppeteer from "puppeteer";

export async function companyRegistrationCheck(registrationNumber: string) {
    try {
        console.log("Scraping website with registration number:", registrationNumber);
        const registrationDetailsUrl = `https://opencorporates.com/companies/gb/${registrationNumber}`;
        const browser = await puppeteer.launch({ headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // Required for serverless environments

         }); 
        const page = await browser.newPage();
        await page.goto(registrationDetailsUrl, { waitUntil: 'domcontentloaded' });
        console.log("link:", registrationDetailsUrl);

        await page.waitForSelector('.vcard', { visible: true, timeout: 10000 });

        const data: any = await page.evaluate(() => {
            const extractText = (selector: string) => {
                const el = document.querySelector(selector);
                return el ? el.textContent?.trim() : "N/A";
            };
            return {
                company_name: extractText(".vcard h1"),
                branch: extractText(".vcard .branch"),
                company_number: extractText(".vcard .company_number"),
                status: extractText(".vcard .status"),
                incorporation_date: extractText(".vcard .incorporation_date"),
                company_type: extractText(".vcard .company_type"),
                jurisdiction: extractText(".vcard .jurisdiction"),
                registered_address: extractText(".vcard .registered_address"),
                latest_accounts_date: extractText(".vcard .latest_accounts_date"),
            };
        });

        console.log("Scraped JSON Data:", JSON.stringify(data, null, 2));

        await browser.close();
        return data;

    } catch (error) {
        console.error("Error checking registration", error);
        throw error;
    }
}