import fetch from 'node-fetch';
import { URL } from 'url';

export async function registrationCheck(domain: string) {
    try {
        const formattedDomain = new URL(domain).hostname.replace("www.", "");
        const rdapUrl = `https://rdap.org/domain/${formattedDomain}`;
    
        console.log("Checking registration for", rdapUrl);
        const response = await fetch(rdapUrl);
        const result = await response.json();
        console.log("Registration Details:", result);
        return result;
    } catch (error) {
        console.error("Error checking registration", error);
        throw error;
    }
}