// src/themes/bike-shop/index.ts

import Header from './components/Header';
import Hero from './components/Hero';
import Features from '../default/components/Features';
import FeaturedProducts from '../default/components/FeaturedProducts';
import CategoryShowcase from '../default/components/CategoryShowcase';
import ProductCarousel from '../default/components/ProductCarousel';
import Newsletter from '../default/components/Newsletter';
import Footer from './components/Footer';
import ProductsList from '../default/components/ProductsList';

export default {
  Header: { type: 'Header', component: Header },
  Hero: { type: 'Hero', component: Hero },
  Features: { type: 'Features', component: Features },
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts },
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase },
  ProductCarousel: { type: 'ProductCarousel', component: ProductCarousel },
  Newsletter: { type: 'Newsletter', component: Newsletter },
  Footer: { type: 'Footer', component: Footer },
  ProductsList: { type: 'ProductsList', component: ProductsList },
};

export const metadata = {
  id: 'bike-shop',
  name: 'Bike Shop',
  description: 'Perfect theme for bicycle and cycling shops',
  thumbnail: '/themes/bike-shop-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};