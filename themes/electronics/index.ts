

import Header from './components/Header';
import Hero from './components/Hero';
import Features from '../default/components/Features';
import FeaturedProducts from '../default/components/FeaturedProducts';
import CategoryShowcase from '../default/components/CategoryShowcase';
import Newsletter from '../default/components/Newsletter';
import Footer from '../default/components/Footer';
import ProductsList from '../default/components/ProductsList';


export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  Newsletter: { type: 'Newsletter', component: Newsletter },
  ProductsList: { type: 'ProductsList', component: ProductsList },
  Footer: { type: 'Footer', component: Footer },
 
};

export const metadata = {
  id: 'electronics',
  name: 'Electronics Shop',
  description: 'Modern theme for electronics stores',
  thumbnail: '/themes/electronics-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};