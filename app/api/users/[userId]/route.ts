import { NextResponse,NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


interface ReqParamProps {
  params: Promise<{ // <- Added Promise wrapper
    userId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: ReqParamProps
) {
  const { userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
    
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
    request : NextRequest,
  { params }: ReqParamProps,
){
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    if(!user || user.id !== session.user.id){
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
        data : {
            ...body,
        },
        where: {
            id: userId
        }   
    });

    return NextResponse.json(updatedUser);


}