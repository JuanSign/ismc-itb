export default function IntroductionSection() {
  return (
    <section id="about" className="py-24 bg-ismc-cream text-ismc-darkBlue relative">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 font-montserrat relative inline-block">
          About The Event
          <span className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-24 h-1.5 bg-ismc-orange rounded-full"></span>
        </h2>
        
        <div className="relative mt-8">
          <span className="hidden md:block absolute -top-8 -left-12 text-6xl text-ismc-teal opacity-20 font-serif">
            &ldquo;
          </span>
          
          <p className="text-lg md:text-2xl leading-relaxed text-gray-700 font-medium font-sans">
            We are the largest mining-focused event in Indonesia, 
            featuring a wide range of competitions. From mining contests to hackathons and photography challenges,
            as well as talk shows and many other activities.
          </p>
          
          <span className="hidden md:block absolute -bottom-8 -right-12 text-6xl text-ismc-teal opacity-20 font-serif">
            &rdquo;
          </span>
        </div>
      </div>
    </section>
  );
}