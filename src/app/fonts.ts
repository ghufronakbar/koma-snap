import localFont from 'next/font/local';

const geistSans = localFont({ src: '../../public/fonts/geist.ttf', variable: '--font-geist-sans', display: 'swap' });
const geistMono = localFont({ src: '../../public/fonts/geist-mono.ttf', variable: '--font-geist-mono', display: 'swap' });
const display = localFont({ src: '../../public/fonts/barlow.ttf', variable: '--font-display', display: 'swap' });

export const fontClasses = `${geistSans.variable} ${geistMono.variable} ${display.variable}`;
