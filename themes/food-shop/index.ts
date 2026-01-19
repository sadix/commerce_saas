// src/themes/food-shop/index.ts

import Header from './components/Header';
import Hero from './components/Hero';
import Features from '../default/components/Features';
import FeaturedProducts from '../default/components/FeaturedProducts';
import CategoryShowcase from '../default/components/CategoryShowcase';
import Newsletter from '../default/components/Newsletter';
import Footer from './components/Footer';

export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  Newsletter: { type: 'Newsletter', component: Newsletter },
  Footer: { type: 'Footer', component: Footer },
};

export const metadata = {
  id: 'food-shop',
  name: 'Food Shop',
  description: 'Delicious theme for food and grocery stores',
  thumbnail: '/themes/food-shop-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};