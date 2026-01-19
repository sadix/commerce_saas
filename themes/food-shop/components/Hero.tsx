// src/themes/food-shop/components/Hero.tsx

export default function Hero({
  title = 'Fresh & Delicious',
  subtitle = 'Farm to Table Quality',
  buttonText = 'Shop Fresh Foods',
  buttonLink = '/products',
}: any) {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-full mb-4">
              🌟 Organic & Fresh
            </span>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {subtitle}
            </p>
            <div className="flex gap-4">
              <a
                href={buttonLink}
                className="px-8 py-4 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition shadow-lg"
              >
                {buttonText}
              </a>
              <a
                href="/about"
                className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition"
              >
                Our Story
              </a>
            </div>
            
            {/* Trust Badges */}
            <div className="flex gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">Organic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">24/7</div>
                <div className="text-sm text-gray-600">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">5★</div>
                <div className="text-sm text-gray-600">Rated</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-50" />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8">
              <div className="aspect-square bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center text-6xl">
                🥗
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}