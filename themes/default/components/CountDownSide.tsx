import React from 'react';
import {useThemeSettings} from '@/theme-settings';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { blob } from 'stream/consumers';

interface CountDownSideProps {
    due_date: Date ;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
}

export default function CountDownSide({
    due_date= new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // default to 1 day from now
    title= "",
    subtitle= "",
    description = "",
    buttonText = "",
    buttonLink = "",
    backgroundImage= ""
    }: CountDownSideProps) 
    {
  const { colors , shape, components, typography, settings} = useThemeSettings ();

  
  //a countdown component that takes a due date and displays the time left until that date
  // The component should display the title, subtitle, description, button text and button link and the countdown on the left side and the image on the right side
  return (
    <section className="py-16 px-15">
    <div className="max-w-7xl mx-auto grid grid-col-1 md:grid-cols-2 items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md" style={{ backgroundColor: colors.surface, color: colors.text, fontFamily: typography.fontBody, borderColor: colors.border }}>
      <div className="md:w-1/2 mb-4 md:mb-0 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text, fontFamily: typography.fontDisplay }}>{title}</h2>
        <h5 style={{ color: colors.secondary, fontFamily: typography.fontDisplay }}> {subtitle}</h5>
        <p className="text-lg" style={{ color: colors.text }}>{description}</p>
        <CountDownAnimation date={due_date} />
        <a
          href={buttonLink}
          className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold mt-6 hover:bg-gray-100 transition"
          style={{
            borderRadius: shape?.radiusMedium || '0.5rem',
            backgroundColor : colors.primary || 'blue',
            color: colors.primaryForeground || 'blue',
            
          }}
        >
          {buttonText}
        </a>
      </div>
      <div className="md:w-1/2">
        {/* Background image */}
        
       <Image src={backgroundImage} alt="Background" className="w-full h-full object-cover rounded-lg" width={1000} height={1000} style={{ width:"auto", height:"auto"}}/>
      </div>
    </div>
    </section>
  );
}

const CountDownAnimation = ({date}: {date: Date}) => {
    //this compoenent should take a date and display the time left until that date in days, hours, minutes and seconds
    const [countdown, setCountdown] = useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
   
     useEffect(() => {
      const interval = setInterval(() => {
        //const now = new Date().getTime();
        //const distance = date.getTime() - now;

        const now = (new Date()).getMilliseconds();
        const distance = +new Date(date) - +new Date();

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(interval);
    }, [date]);

    return (
      <div className="flex space-x-4 justify-center">
        {/* <div className="flex flex-col items-center">
            due date: {date.toLocaleString()}
        </div> */}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{countdown.days}</span>
          <span className="text-sm text-gray-500">Days</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{countdown.hours}</span>
          <span className="text-sm text-gray-500">Hours</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{countdown.minutes}</span>
          <span className="text-sm text-gray-500">Minutes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{countdown.seconds}</span>
          <span className="text-sm text-gray-500">Seconds</span>
        </div>
      </div>
    );
}
