// src/themes/bike-shop/components/Hero.tsx

export default function Hero({
  title = 'Ride Your Dream',
  subtitle = 'Premium Bicycles & Accessories',
  buttonText = 'Shop Now',
  buttonLink = '/products',
  backgroundImage,
}: any) {
  return (
    <section
      className="relative h-[600px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${backgroundImage})` || 
          `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600"><rect fill="%23059669" width="1200" height="600"/></svg>')`,
      }}
    >
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-bold mb-4 leading-tight">{title}</h1>
            <p className="text-2xl mb-8 text-gray-100">{subtitle}</p>
            <div className="flex gap-4">
              <a
                href={buttonLink}
                className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition text-lg"
              >
                {buttonText}
              </a>
              
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" className="w-full h-24">
          <path d="M0,0 Q300,100 600,50 T1200,0 L1200,120 L0,120 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}