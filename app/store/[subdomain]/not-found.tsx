import Link from 'next/link';
import whiteLogo from '../../../public/images/logos/logo-baobuy-white.png'
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <div className='mx-auto bg-black'>
            <Image src={whiteLogo.src}  width={whiteLogo.width/2} height={whiteLogo.height/2} className='mx-auto' alt="Logo Platform"/>
        </div>
        {/* Error Code Label */}
        <p className=" font-semibold text-blue-600 dark:text-blue-400 text-4xl">
          404
        </p>
        
        {/* Main Heading */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
          Page not found
        </h1>
        
        {/* Explanatory Text */}
        <p className="mt-6 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
        </p>
        
        {/* Action Buttons */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Go back home
          </Link>
          
          
        </div>
      </div>
    </main>
  );
}
