import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section 
      id="hero" 
      className="relative isolate w-full h-screen min-h-[600px] flex flex-col justify-center items-center overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/pages/main/hero-bg.jpg"
          alt="ISMC XV Mining Environment"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-ismc-darkBlue/75 mix-blend-multiply" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
        <h2 className="text-ismc-orange font-montserrat uppercase tracking-[0.2em] text-sm md:text-base mb-6 font-bold shadow-black drop-shadow-sm">
          The 15th Annual Event
        </h2>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight font-montserrat text-white drop-shadow-lg">
          ISMC XV
        </h1>
        <p className="text-xl md:text-2xl text-ismc-lightBlue mb-12 font-light max-w-2xl mx-auto drop-shadow-md">
          Indonesian Students Mining Competition
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <Link
            href="/register"
            className="bg-ismc-orangeRed hover:bg-ismc-darkRed text-white text-lg px-8 py-3 rounded shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1 font-semibold inline-block"
          >
            Register
          </Link>
        </div>
      </div>
    </section>
  );
}