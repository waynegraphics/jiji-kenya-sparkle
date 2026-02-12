import { Smartphone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const AppDownload = () => {
  return (
    <section className="py-10 bg-card">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-primary to-apa-green-dark rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6">
          {/* Icon */}
          <div className="w-20 h-20 md:w-28 md:h-28 bg-card rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Smartphone className="h-10 w-10 md:h-14 md:w-14 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-2">
              Download the APA Bazaar App
            </h2>
            <p className="text-primary-foreground/80 text-sm md:text-base mb-3">
              Buy and sell faster on your phone! Get the best deals and post ads on the go.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1 text-secondary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-primary-foreground/80 text-sm ml-2">
                4.8 rating • 1M+ downloads
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-semibold px-6"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2H6.477C5.106 2 4 3.106 4 4.477v15.046C4 20.894 5.106 22 6.477 22h11.046C18.894 22 20 20.894 20 19.523V4.477C20 3.106 18.894 2 17.523 2zM12 20c-.828 0-1.5-.672-1.5-1.5S11.172 17 12 17s1.5.672 1.5 1.5S12.828 20 12 20zm4.5-4H7.5V5h9v11z"/>
              </svg>
              App Store
            </Button>
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-semibold px-6"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 9.001l-2.302 2.302-8.634-8.645z"/>
              </svg>
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;