import fetch from 'node-fetch';
import { URL } from 'url';
import puppeteer from 'puppeteer';

export async function registrationCheck(domain: string) {
    try {
        const formattedDomain = new URL(domain).hostname.replace("www.", "");
        const rdapUrl = `https://rdap.org/domain/${formattedDomain}`;

        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();
        await page.goto(rdapUrl, { waitUntil: 'domcontentloaded' });
    
        console.log("Checking registration for", rdapUrl);
        const response = await fetch(rdapUrl);
        const preContent = await page.$eval('pre', el => el.textContent);
        console.log("Pre Content:", preContent);

        if (preContent) {
            console.log("Parsing RDAP data");   
            const rdapData = JSON.parse(preContent);
            const registrant = rdapData.entities.find((e: any) => e.roles.includes("registrant"));
            const registrar = rdapData.entities.find((e: any) => e.roles.includes("registrar"));
            const getName = (entity: any) =>
            entity?.vcardArray[1].find((x: any) => x[0] === "org" || x[0] === "fn")?.[3] || "Not available";

            const keyInfo = {
                domain: rdapData.ldhName,
                registrationDate: rdapData.events[0].eventDate,
                expirationDate: rdapData.events[1].eventDate,
                registrar: rdapData.entities[0].handle,
                registrationStatus: rdapData.status[0],
                nameServers: rdapData.nameservers,
                ipAddresses: rdapData.ipAddresses,
                registrantInfo: getName(registrant),
                registrarInfo: getName(registrar),
                secureDNS: rdapData.secureDNS,
                publicIds: rdapData.publicIds,
            }
            return keyInfo;

        } else {
            throw new Error("Failed to retrieve content from the page.");
        }
    } catch (error) {
        console.error("Error checking registration", error);
        throw error;
    }
}