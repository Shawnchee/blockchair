import sslChecker from 'ssl-checker';
import { URL } from 'url';

export interface IResolvedValues {
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    valid: boolean;
    issuer: string;
}

export async function getSSLDetails(domain: string): Promise<IResolvedValues> {
    try {
    const formattedDomain = new URL(domain).hostname;
    console.log("Checking SSL for", formattedDomain);
    const sslDetails = await sslChecker(formattedDomain);
    console.log("SSL Details:", sslDetails);
    return sslDetails as IResolvedValues;
} catch (error) {
    console.error("Error getting SSL details", error);
    throw error;
}
}