import Image from 'next/image';

export default function SponsorSection() {
  return (
    <section id="sponsors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="pt-16 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Sponsored By</h2>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full mb-12"></div>
          <div className="w-full max-w-5xl mx-auto">
            <Image
              src="/sponsors/logo/SPONSOR.png" 
              alt="ISMC XV Media Partners"
              width={0} height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="pt-16 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Supported By</h2>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full mb-12"></div>
          <div className="w-full max-w-5xl mx-auto">
            <Image
              src="/sponsors/logo/SUPPORT.png" 
              alt="ISMC XV Media Partners"
              width={0} height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="pt-16 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Media Partner</h2>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full mb-12"></div>
          <div className="w-full max-w-5xl mx-auto">
            <Image
              src="/sponsors/logo/MEDIA PARTNER.png" 
              alt="ISMC XV Media Partners"
              width={0} height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

      </div>
    </section>
  );
}