import { NextRequest , NextResponse } from 'next/server';
import { companyRegistrationCheck } from '@/utils/regCheck/companyRegistrationCheck';

export async function POST(req: NextRequest) {
    try {
        const { registrationNumber } = await req.json();
        console.log("Checking registration for", registrationNumber);
        const result = await companyRegistrationCheck(registrationNumber);
        console.log("Registration Details:", result);
        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error checking registration", error);
        return NextResponse.json({ error: 'Failed to check registration' }, { status: 500 });
    }
}
