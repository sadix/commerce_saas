import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductsList from './components/ProductsList';
import Footer from './components/Footer';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryShowcase from './components/CategoryShowcase';
import ProductCarousel from './components/ProductCarousel';
import Newsletter from './components/Newsletter';

export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  ProductsList: { type: 'ProductsList', component: ProductsList },
  Footer: { type: 'Footer', component: Footer },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  ProductCarousel: { type: 'ProductCarousel', component: ProductCarousel },
  Newsletter: { type: 'Newsletter', component: Newsletter },

};

export const metadata = {
  id: 'default',
  name: 'Default Theme',
  description: 'A clean and simple default theme',
  thumbnail: '/themes/default-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};