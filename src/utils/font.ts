import { Fira_Mono, Montserrat, Playfair_Display } from "next/font/google";

export const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Fira_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  style: ["normal"],
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfairDisplay-serif",
  style: ["normal", "italic"],
});
