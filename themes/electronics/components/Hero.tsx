// src/themes/electronics/components/Hero.tsx

export default function Hero({ title = 'Latest Tech', subtitle = 'Cutting-Edge Electronics' }: any) {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
      <div className="max-w-7xl mx-auto px-4 py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-blue-600 text-sm font-semibold rounded mb-4">
              ⚡ New Arrivals
            </span>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
            <div className="flex gap-4">
              <a href="/products" className="px-8 py-4 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition">
                Shop Now
              </a>
              <a href="/deals" className="px-8 py-4 border border-blue-600 rounded-lg font-semibold hover:bg-blue-600/10 transition">
                View Deals
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700">
              <div className="text-8xl text-center">💻</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}