// src/themes/home-goods/components/Hero.tsx

export default function Hero({ title = 'Transform Your Space', subtitle = 'Premium Home Essentials' }: any) {
  return (
    <section className="relative bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-full mb-4">
              ✨ New Collection
            </span>
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {subtitle}
            </p>
            <a href="/products" className="inline-block px-8 py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition shadow-lg">
              Explore Collection
            </a>
            
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-3xl font-bold text-amber-600">500+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">100%</div>
                <div className="text-sm text-gray-600">Quality</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-5xl mb-4">🛋️</div>
              <div className="font-semibold">Furniture</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
              <div className="text-5xl mb-4">🕯️</div>
              <div className="font-semibold">Decor</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-5xl mb-4">🍽️</div>
              <div className="font-semibold">Kitchenware</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
              <div className="text-5xl mb-4">🛏️</div>
              <div className="font-semibold">Bedding</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}