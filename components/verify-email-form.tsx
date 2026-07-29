"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"

const VerifyEmailForm = () => {
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [redirecting, setRedirecting] = useState(false);
    const searchParams = useSearchParams();
    const token = searchParams.get("token")

    const onSubmit = useCallback(() => {
        if (!token) {
            setError("No token provided");
            return;
        }
        fetch(`/api/verify-email?token=${token}`, {
            method: "POST",
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                setSuccess(data.success);
                setMessage(data.message);
                setTimeout(() => {
                    setRedirecting(true);
                    window.location.href = "/login?verified=true";
                }, 3000);
            }
            if (data.error) {
                setError(data.error);
            }
        })
        .catch((error) => {
            console.error(error);
            setError("An unexpected error occurred");
        });
    }, [token, success, error]);

   
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-black py-2">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
            <button onClick={onSubmit} className="w-full bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Verify Email
            </button>
            {success && <p className="text-green-500">{success}</p>}
            {error && <p className="text-red-500">{error}</p>}
            {message && <p className="text-green-500">{message}</p>}
            {redirecting && <p className="text-yellow-500">Redirecting to login page...</p>}
        </div>
    </div>
  )
}

export default VerifyEmailForm