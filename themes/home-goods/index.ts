// src/themes/food-shop/index.ts

import Header from './components/Header';
import Hero from './components/Hero';
import Features from '../default/components/Features';
import FeaturedProducts from '../default/components/FeaturedProducts';
import CategoryShowcase from '../default/components/CategoryShowcase';
import Newsletter from '../default/components/Newsletter';
import Footer from './components/Footer';
import ProductsList from '../default/components/ProductsList';

export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  Newsletter: { type: 'Newsletter', component: Newsletter },
  Footer: { type: 'Footer', component: Footer },
  ProductsList: { type: 'ProductsList', component: ProductsList },
};

export const metadata = {
  id: 'home-goods',
  name: 'Home Goods Shop',
  description: 'Theme for home goods and household items',
  thumbnail: '/themes/home-goods-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};