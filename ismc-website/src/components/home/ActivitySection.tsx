import Image from 'next/image';
import { activities } from './data/activities';

export default function ActivitySection() {
  return (
    <section id="activities" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-ismc-darkBlue text-3xl md:text-4xl font-bold mb-4 font-montserrat">
            Our Activities
          </h2>
          <p className="text-ismc-teal text-lg">
            Discover the challenges and insights waiting for you
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {activities.map((activity, index) => (
            <article 
              key={index} 
              className="flex flex-col md:flex-row bg-ismc-cream rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-ismc-lightBlue/20 group"
            >
              <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="p-8 w-full md:w-3/5 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-ismc-darkBlue mb-3 font-montserrat">
                  {activity.title}
                </h3>
                <div className="w-12 h-1.5 bg-ismc-orange mb-5 rounded-full" />
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {activity.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}