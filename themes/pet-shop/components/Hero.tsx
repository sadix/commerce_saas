// src/themes/pet-shop/components/Hero.tsx

export default function Hero({ title = 'Happy Pets, Happy Life', subtitle = 'Premium Pet Supplies' }: any) {
  return (
    <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="mb-6">
            <span className="text-6xl">🐾</span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {subtitle}
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/products" className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition shadow-lg">
              Shop for Dogs
            </a>
            <a href="/products" className="px-8 py-4 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-700 transition shadow-lg">
              Shop for Cats
            </a>
          </div>
          
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-2">🦴</div>
              <div className="font-semibold">Premium Food</div>
              <div className="text-sm text-gray-600">Nutrition First</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎾</div>
              <div className="font-semibold">Fun Toys</div>
              <div className="text-sm text-gray-600">Play Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">❤️</div>
              <div className="font-semibold">Pet Care</div>
              <div className="text-sm text-gray-600">Health First</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}