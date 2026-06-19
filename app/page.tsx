// src/app/page.tsx

import {Link} from '@/i18n/navigation'
import logoImage from '../public/images/logos/logo-baobuy-colored.png';
import whiteLogo from '../public/images/logos/logo-baobuy-white.png'
import dashboardMockup from '../public/images/dashboard-mockup.png'; 

import themeIcon from '../public/images/theme_icon.png';
import builderIcon from '../public/images/drag_icon.png';
import domainIcon from '../public/images/domain_icon.png';


import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LandingLinks } from '@/components/LandingLinks';
import {LocaleSwitcher} from '@/components/LocaleSwitcher';

import { use } from 'react';
import { setRequestLocale } from 'next-intl/server';



import {useTranslations } from 'next-intl';


export default function HomePage() {
  const t = useTranslations('landing');
 
  // Source - https://stackoverflow.com/a/66624143
// Posted by juliomalves, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-19, License - CC BY-SA 4.0


  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1E2A3A]">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div><img src={logoImage.src} alt="StoreBuilder Logo" className="h-8 mr-2" /></div>{/* <h1 className="text-2xl font-bold text-blue-600">StoreBuilder</h1> */}
          {/* Navigation to sections Links */}
          <div className="hidden md:flex space-x-4">
            <Link href="#features" className="px-4 py-2 text-gray-700 hover:text-gray-900">
              {t('nav.features')}
            </Link>
            <Link href="#pricing" className="px-4 py-2 text-gray-700 hover:text-gray-900">
              {t('nav.pricing')}
            </Link>
            <Link href="#testimonials" className="px-4 py-2 text-gray-700 hover:text-gray-900">
              {t('nav.testimonials')}
            </Link>
          </div>


          <LandingLinks />

         

        </div>
      </nav>
       {/*Mobile menu collapsible*/}

          <div className=' md:hidden relative'>
             <input
              id="mobile-menu-toggle"
              type="checkbox"
              className="peer absolute z-10 opacity-0"
              />
              <span id="kebab"className="relative z-0 block peer-checked:hidden p-3 bg-white ">⁝ Menu</span>
              <span id="x-mark" className="relative z-0 hidden peer-checked:block bg-white">✕</span>

              <div id="mobile-menu" className="hidden peer-checked:flex  flex-col bg-white">
                <Link href="#features" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  {t('nav.features')}
                </Link>
                <Link href="#pricing" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  {t('nav.pricing')}
                </Link>
                <Link href="#testimonials" className="px-4 py-2 text-gray-700 hover:text-gray-900">
                  {t('nav.testimonials')}
                </Link>

              </div>

            
          </div>

      {/* <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Build Your Online Store in Minutes
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Create a professional e-commerce store with our easy-to-use platform.
          No coding required. Start selling online today.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-lg hover:bg-gray-50 shadow-lg border border-gray-300"
          >
            View Demo
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Themes</h3>
            <p className="text-gray-600">
              Choose from professionally designed themes and customize them to match your brand.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2">Quick Setup</h3>
            <p className="text-gray-600">
              Get your store online in minutes with our intuitive drag-and-drop builder.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile Optimized</h3>
            <p className="text-gray-600">
              All themes are fully responsive and optimized for mobile shopping.
            </p>
          </div>
        </div>
      </main> */}
      {/* Hero Section */}
      <section id="hero" className="container mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 py-16">
        <div className=''>
          <h1 className="text-5xl font-bold leading-tight">
            {t('title_first')}
            <br />
            {t('title_second')}
          </h1>
          <p className="mt-6 text-lg text-gray-700 max-w-xl">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex gap-4">
            
            <Link href="/login" className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl">
            {t('button_action1')}
            </Link>
            
            <Link href="https://mamy-store.baobuy.site/shop" className="rounded-2xl px-6 py-3 border border-gray-300 hover:bg-gray-100">
              {t('button_action2')}
            </Link>
          </div>
        </div>

        <div >
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <img
              src={dashboardMockup.src}
              alt="BaoBuy Dashboard"
              className="rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-20 max-w-7xl">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('features.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[{name: t('features.feature1_title') , icon: themeIcon, text:t('features.feature1_text')}, {name: t('features.feature2_title'), icon: builderIcon, text:t('features.feature2_text')}, {name: t('features.feature3_title'), icon: domainIcon, text:t('features.feature3_text')}].map((feature) => (
            <Card key={feature.name} className="rounded-2xl shadow-sm hover:shadow-lg transition text-center border-0">
              <CardContent className="p-6">
                <img src={feature.icon.src} alt={feature.name} className="w-20 h-20 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                <p className="text-gray-600">
                  {feature.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */ }
      <section id="pricing" className="bg-white py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-3xl font-semibold text-center mb-12">
             {t('pricing.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tier: 'Basic', price: '$15/mo', features: ['Unlimited Products', 'Basic Themes', 'Email Support','Generated Domain name'] },
              { tier: 'Pro', price: '$29/mo', features: ['All Basic Features', 'Premium Themes', 'Priority Support', 'Custom Domain'] },
              { tier: 'Enterprise', price: 'Contact Us', features: ['All Pro Features', 'Dedicated Account Manager', 'Custom Integrations', '24/7 Support'] },
            ].map((plan) => (
              <Card key={plan.tier} className="rounded-2xl shadow-sm hover:shadow-lg transition text-center border-0">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{plan.tier}</h3>
                  <p className="text-4xl font-bold mb-6">{plan.price}</p>
                  <ul className="mb-6 text-gray-600">
                    {plan.features.map((feature) => (
                      <li key={feature} className="mb-2">• {feature}</li>
                    ))}
                  </ul>
                  <Button className="bg-[#F68B1E] hover:bg-[#e07c18] text-white px-6 py-3 rounded-2xl">
                    {t('pricing.button')} {plan.tier}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section id="cta" className="bg-[#1E2A3A] text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold">Start Selling Today</h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Join the next generation of African businesses going digital with BaoBuy.
          </p>
          <Button className="mt-8 bg-[#F68B1E] hover:bg-[#e07c18] px-8 py-4 rounded-2xl">
            Create Your Store
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="container mx-auto px-6 py-20 max-w-7xl">
        <h2 className="text-3xl font-semibold text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Amina K.', feedback: 'BaoBuy made it so easy to set up my online store. The themes are beautiful and the support team is fantastic!' },
            { name: 'John D.', feedback: 'I love how customizable my store is with BaoBuy. The drag-and-drop builder is a game-changer.' },
            { name: 'Sophie M.', feedback: 'Thanks to BaoBuy, I was able to launch my business quickly and start selling to customers worldwide.' },
          ].map((testimonial) => (
            <Card key={testimonial.name} className="rounded-2xl shadow-sm hover:shadow-lg transition border-0">
              <CardContent className="p-6">
                <p className="text-gray-700 italic">"{testimonial.feedback}"</p>
                <h4 className="mt-4 font-semibold">{testimonial.name}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/*Bottom Logo & Menus */}
      <section className=" xl:w-full bg-black text-white " >
        <div className=" container flex flex-col gap-16 py-16 my-0 sm:justify-start sm:pb-16 md:flex-row md:flex-nowrap md:justify-between md:pb-20 md:py-20 md:gap-20 max-w-7xl mx-auto">
        <div className="min-w-24">
          <a href="" data-component-name="logo-home" className="inline-block shrink-0">
            <img src={whiteLogo.src} alt="" className="h-11" data-component-name="" />
        </a>
        <LocaleSwitcher />
        </div>
        <div className="md:block md:justify-end">
          <div className="flex flex-col flex-wrap gap-12 gap-x-4 md:gap-20 md:gap-x-16 sm:grid sm:max-h-fit sm:grid-cols-3 lg:grid-cols-4 max-h-368 sm:max-h-300">
            <div className="w-[calc(50%-1rem)] sm:w-fit" >
              <h2 className="text-base font-bold text-white">BaoBuy</h2>
              <ul className="mt-4 md:mt-6">
                <li>
                  <a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="/about" aria-label="About" data-component-name="about">About</a>
                </li>
               {/*  <li>
                  <a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="/careers" aria-label="Careers" data-component-name="careers">Careers</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Investors" data-component-name="investors">Investors</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Press and Media" data-component-name="press-and-media">Press and Media</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="/partners" aria-label="Partners" data-component-name="partners">Partners</a></li> */}
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="/affiliates" aria-label="Affiliates" data-component-name="affiliates">Affiliates</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="/privacy-policy" aria-label="Legal" data-component-name="legal">Privacy Policy</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Service Status" data-component-name="service-status">Service Status</a></li>
              </ul>
            </div>
            <div className="w-[calc(50%-1rem)] sm:w-fit" data-component-name="support">
              <h2 className="text-base font-bold text-white">Support</h2>
              <ul className="mt-4 md:mt-6">
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Merchant Support" data-component-name="merchant-support">Merchant Support</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Shopify Help Center" data-component-name="shopify-help-center">BaoBuy Help Center</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Hire a Partner" data-component-name="hire-a-partner">Hire a Partner</a></li>
                
              </ul>
            </div>
            <div className="w-[calc(50%-1rem)] sm:w-fit" data-component-name="integration">
              <h2 className="text-base font-bold text-white">Integration</h2>
              <ul className="mt-4 md:mt-6">
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Merchant Support" data-component-name="merchant-support">API Documentation</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Shopify Help Center" data-component-name="shopify-help-center">BaoBuy Theme creation</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Hire a Partner" data-component-name="hire-a-partner">Create a dev account</a></li>
                <li><a className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" href="" aria-label="External source: Shopify Academy" data-component-name="shopify-academy">BaoBuy Academy</a></li>
              
              </ul>
            </div>
          </div>
        </div>
        </div>
      </section> 

      

      {/* Footer with menu  */} 
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} BaoBuy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}