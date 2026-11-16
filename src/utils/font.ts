import { Geist_Mono, Montserrat, Playfair_Display } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfairDisplay-serif",
  style: ["normal", "italic"],
});
