import { getVerificationTokenByEmail } from '@/data/verification-token';
import { prisma} from './prisma';
import { randomUUID } from 'crypto';

export const generateVerificationToken = async (email: string) => {
    // Generate a random token 
    const token = randomUUID();
    const expires = new Date().getTime() + 1000 * 60 * 60 * 1; // 1 hours

    // Check if a token already exists for the user
    const existingToken = await getVerificationTokenByEmail(email)

    if(existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {identifier: email, token: existingToken.token}
            }
        })
    }

    // Create a new verification token
    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires: new Date(expires)
        }
    })

    return verificationToken;
}