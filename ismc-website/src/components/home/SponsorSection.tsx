import Image from 'next/image';
import { sponsors, support } from './data/sponsors'; 
import { SponsorTier } from './data/types';

const getSponsorsByTier = (tier: SponsorTier) => sponsors.filter((s) => s.tier === tier);

export default function SponsorSection() {
  const platinum = getSponsorsByTier('platinum');
  const gold = getSponsorsByTier('gold');
  const silver = getSponsorsByTier('silver');
  const bronze = getSponsorsByTier('bronze');

  return (
    <section id="sponsors" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="mb-32">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Sponsored By</h2>
          <div className="w-24 h-1.5 bg-ismc-orange mx-auto rounded-full mb-16"></div>
          {platinum.length > 0 && (
            <div className="mb-24">
              <div className="flex flex-wrap justify-center gap-16 items-center">
                {platinum.map((s, idx) => (
                  <div key={idx} className="relative h-40 md:h-56 max-w-[300px] md:max-w-[400px] transition-all duration-500 hover:scale-105">
                    <Image 
                      src={s.logo} 
                      alt={s.name} 
                      width={0} height={0} 
                      // FIX: Download smaller images
                      sizes="(max-width: 768px) 80vw, 40vw"
                      className="w-auto h-full max-w-full object-contain" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {gold.length > 0 && (
            <div className="mb-20">
              <div className="flex flex-wrap justify-center gap-10 items-center max-w-5xl mx-auto">
                {gold.map((s, idx) => (
                  <div key={idx} className="relative h-24 md:h-28 max-w-[220px] transition-all duration-300 hover:scale-105">
                    <Image 
                      src={s.logo} 
                      alt={s.name} 
                      width={0} height={0} 
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="w-auto h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {silver.length > 0 && (
            <div className="mb-16">
              <div className="flex flex-wrap justify-center gap-8 items-center max-w-6xl mx-auto">
                {silver.map((s, idx) => (
                  <div key={idx} className="relative h-16 md:h-20 max-w-40 transition-opacity">
                    <Image 
                      src={s.logo} 
                      alt={s.name} 
                      width={0} height={0} 
                      sizes="(max-width: 768px) 33vw, 15vw"
                      className="w-auto h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {bronze.length > 0 && (
            <div>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 max-w-4xl mx-auto">
                {bronze.map((s, idx) => (
                  <div key={idx} className="relative h-12 md:h-14 max-w-[120px] transition-opacity">
                    <Image 
                      src={s.logo} 
                      alt={s.name} 
                      width={0} height={0} 
                      sizes="(max-width: 768px) 25vw, 10vw"
                      className="w-auto h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {support.length > 0 && (
          <div className="pt-16 pb-20 border-t border-gray-200">
             <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Supported By</h2>
            <div className="w-16 h-1 bg-ismc-teal mx-auto rounded-full mb-12"></div>
            <div className="flex flex-wrap justify-center gap-10 items-center max-w-6xl mx-auto">
              {support.map((s, idx) => (
                <div key={idx} className="relative h-16 md:h-20 max-w-[180px] transition-all duration-300">
                  <Image 
                    src={s.logo} 
                    alt={s.name} 
                    width={0} height={0} 
                    sizes="(max-width: 768px) 33vw, 15vw"
                    className="w-auto h-full max-w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-16 border-t border-gray-200">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 font-montserrat text-ismc-darkBlue">Media Partner</h2>
          <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full mb-12"></div>
          <div className="w-full max-w-5xl mx-auto">
            <Image
              src="/sponsors/logo/Media Partner.png" 
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