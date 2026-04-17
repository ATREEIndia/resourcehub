import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { MyContextProvider } from "./Context/MyContext";
import Footer from "./Components/Footer";
import Navbar from "./Components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const getpoppins = Poppins({
  variable: "--font-poppins",
  weight:["400","500","600","700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResourceHub-ATREE",
  description: "Developed by Sreekuttan VN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${getpoppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true} >
        <MyContextProvider>
          <Navbar/>
          {children}
          <Footer/>
        </MyContextProvider>
        
        </body>
        <GoogleAnalytics gaId="G-TTJ5SNX6W6" />
    </html>
  );
}
