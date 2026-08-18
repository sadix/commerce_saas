
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ResendVerificationEmailLink } from '@/components/auth/ResendVerificationLink';




export async function generateMetadata() {
  return {
    title: 'Resend Verification Email',
  };
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};



export default async function ResendVerificationEmailPage({searchParams}:PageProps) {
  const session = await getServerSession(authOptions);
  //const email = new URL(Request.url).searchParams.get('email') || '';
  const {email} = await searchParams ;
  if(session){
    redirect('/dashboard');
  }
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="text-center text-3xl font-bold">Resend Verification Email</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please provide your email address to resend the verification email.
            </p>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold">Resend Verification Email</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-500">
              create a new account
            </a>
          </p>
        </div>
        <ResendVerificationEmailLink  email={email as string} />
        
      </div>
    </div>
  );
}