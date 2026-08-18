import {NextRequest} from 'next/server';
import {sendVerificationEmail} from '@/lib/email';
//import {getVerificationTokenByEmail} from '@/data/verification-token';
import {generateVerificationToken} from '@/lib/token';

export async function POST(request: NextRequest) {
    try {  
        const body = await request.json();
        const {email} = body;
        const verificationToken = await generateVerificationToken(email);

        if (!verificationToken) {
            return new Response(JSON.stringify({ error: 'Verification token not found' }), {
                status: 404
            });
        }

        await sendVerificationEmail(email, verificationToken.token);

        return new Response(JSON.stringify({ message: 'Verification email sent successfully' }), {
            status: 200
        });
    } catch (error) {
        console.error('Error resending verification email:', error);
        return new Response(JSON.stringify({ error: 'Failed to resend verification email' }), {
            status: 500
        });
    }
}