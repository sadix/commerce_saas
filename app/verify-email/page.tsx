import VerifyEmailForm from '@/components/verify-email-form'
import {Logo} from '@/components/ui/Logo';

export default function VerifyEmailPage() {

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <Logo/>
                <VerifyEmailForm />
            </div>
        </div>
    );
}