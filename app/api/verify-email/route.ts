// ... imports ...
import { prisma } from "@/lib/prisma";
import { VerificationToken } from "@prisma/client";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  // 1. Validate token with DB
  const verificationToken= await prisma.verificationToken.findFirst({
    where: { token : token || "" }, 
    
  });
  if (!verificationToken) {
    return new Response("Invalid or expired token", { status: 400 });
  }
  // 2. Update user: { emailVerified: new Date() }
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });
  // 3. Delete token
  await prisma.verificationToken.delete({
    where: { identifier_token: { token: token || "", identifier: verificationToken.identifier } },
  });
  // 4. Redirect to login
   // return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=true`);
   //return { success: true, message: "Email verified successfully" };
   return new Response(JSON.stringify({ success: true, message: "Email verified successfully" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}