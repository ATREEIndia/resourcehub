import Image from "next/image";
import Navbar from "./Components/Navbar";
import BannerWithSearch from "./Components/BannerWithSearch";
import FeaturedCollections from "./Components/FeaturedCollections";
import WhatsNew from "./Components/WhatsNew";

export default function Home() {
  return (
    <main>
      
      <BannerWithSearch/>
      <FeaturedCollections/>
      <WhatsNew/>
      


      

    </main>
  );
}
