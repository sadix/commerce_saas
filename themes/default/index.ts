import Header from './components/Header';
import HeaderLogoTop from './components/HeaderLogoTop';
import Hero from './components/Hero';
import Features from './components/Features';
import ProductsList from './components/ProductsList';
import Footer from './components/Footer';
import FeaturedProducts from './components/FeaturedProducts';
import CategoryShowcase from './components/CategoryShowcase';
import ProductCarousel from './components/ProductCarousel';
import Newsletter from './components/Newsletter';
import { ThemeComponent } from '@/types/theme';
import ProductsCollectionList from './components/ProductCollectionList';

export default {
  Header: { type: 'Header', component: Header } as ThemeComponent,
  HeaderLogoTop: { type: 'HeaderLogoTop', component: HeaderLogoTop } as ThemeComponent,
  Hero: { type: 'Hero', component: Hero } as ThemeComponent,
  Features: { type: 'Features', component: Features } as ThemeComponent,
  ProductsList: { type: 'ProductsList', component: ProductsList } as ThemeComponent,
  ProductsCollectionList : { type: 'ProductsCollectionList', component: ProductsCollectionList } as ThemeComponent,
  Footer: { type: 'Footer', component: Footer } as ThemeComponent,
  FeaturedProducts: { type: 'FeaturedProducts', component: FeaturedProducts } as ThemeComponent,
  CategoryShowcase: { type: 'CategoryShowcase', component: CategoryShowcase } as ThemeComponent,
  ProductCarousel: { type: 'ProductCarousel', component: ProductCarousel },
  Newsletter: { type: 'Newsletter', component: Newsletter } as ThemeComponent,

};

export const metadata = {
  id: 'default',
  name: 'Default Theme',
  description: 'A clean and simple default theme',
  thumbnail: '/themes/default-thumb.jpg',
  version: '1.0.0',
  author: 'SaaS Platform',
};