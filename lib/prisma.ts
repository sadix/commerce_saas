import {PrismaClient} from '@prisma/client';
import { computeTrialEnd } from '@/lib/trial';
//import {PrismaPostgresAdapter} from '@prisma/adapter-ppg';
import {PrismaPg} from '@prisma/adapter-pg';


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
 // prisma: PrismaClient
};

 const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  shadowDatabaseConnectionString: process.env.SHADOW_DATABASE_URL!,
});

//export const prisma = globalForPrisma.prisma ?? new PrismaClient({adapter});
//if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const basePrisma = globalForPrisma.prisma ?? new PrismaClient({adapter});

export const prisma = basePrisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        const user = await query(args);

        // Best-effort: if this fails, `getAccessStatus` in subscription.ts
        // fails open to a fresh Free trial rather than locking the user out,
        // but you should still keep an eye on errors here.
        await basePrisma.subscription
          .create({
            data: {
              userId: user.id? user.id : "", // Ensure userId is not null
              plan: 'FREE',
              status: 'TRIALING',
              trialEndsAt: computeTrialEnd(),
              stripeCustomerId: user.id? user.id : "", // Ensure stripeCustomerId is not null
              stripeSubscriptionId: user.id,
              stripePriceId: null,
            },
          })
          .catch((err) => {
            console.error(`Failed to create trial subscription for user ${user.id}:`, err);
          });

        return user;
      },
    },
  },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
