import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductsList from './components/ProductsList';
import Footer from './components/Footer';
import FeaturedProducts from '../default/components/FeaturedProducts';
import CategoryShowcase from '../default/components/CategoryShowcase';
import Newsletter from '../default/components/Newsletter';


export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  ProductsList: { type: 'ProductsList', component: ProductsList },
  Footer: { type: 'Footer', component: Footer },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  Newsletter: { type: 'Newsletter', component: Newsletter },

};

export const metadata = {
  id: 'modern',
  name: 'Modern Theme',
  description: 'A modern and stylish theme',
  thumbnail: '/themes/modern-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};