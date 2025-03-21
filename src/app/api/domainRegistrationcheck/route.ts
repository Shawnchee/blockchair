import { NextRequest , NextResponse } from 'next/server';
import { registrationCheck } from '@/utils/regCheck/domainRegistrationCheck';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();
        console.log("Checking registration for", url);
        const result = await registrationCheck(url);
        console.log("Registration Details:", result);
        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error checking registration", error);
        return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 });
    }
}
