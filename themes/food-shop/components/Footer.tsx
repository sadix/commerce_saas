// src/themes/food-shop/components/Footer.tsx

export default function Footer({ shopData }: any) {
  return (
    <footer className="bg-gradient-to-br from-orange-50 to-yellow-50 border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl text-orange-600 mb-4">{shopData.name}</h3>
            <p className="text-gray-600 text-sm mb-4">
              Fresh, organic, and locally sourced foods delivered to your door.
            </p>
            <div className="flex gap-2">
              <span className="text-2xl">🥬</span>
              <span className="text-2xl">🍎</span>
              <span className="text-2xl">🥖</span>
              <span className="text-2xl">🥛</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/fruits" className="hover:text-orange-600">Fresh Fruits</a></li>
              <li><a href="/vegetables" className="hover:text-orange-600">Vegetables</a></li>
              <li><a href="/dairy" className="hover:text-orange-600">Dairy</a></li>
              <li><a href="/bakery" className="hover:text-orange-600">Bakery</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/delivery" className="hover:text-orange-600">Delivery Info</a></li>
              <li><a href="/returns" className="hover:text-orange-600">Returns Policy</a></li>
              <li><a href="/freshness" className="hover:text-orange-600">Freshness Guarantee</a></li>
              <li><a href="/contact" className="hover:text-orange-600">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Stay Fresh</h4>
            <p className="text-sm text-gray-600 mb-4">
              Get weekly recipes and special offers
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <button className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-orange-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} {shopData.name}. Farm Fresh Quality.</p>
        </div>
      </div>
    </footer>
  );
}