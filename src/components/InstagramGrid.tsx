import React from 'react';
import { Instagram, Heart, MessageCircle } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: string;
  comments: string;
  caption: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'ig-1',
    imageUrl: 'https://images.unsplash.com/photo-1609137144814-1e0e47087050?auto=format&fit=crop&q=80&w=500',
    likes: '1,420',
    comments: '88',
    caption: 'Cutting through the shallow river stream approaches on the Himalayan 450. #RideHard #ArunachalPradesh'
  },
  {
    id: 'ig-2',
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=500',
    likes: '958',
    comments: '42',
    caption: 'Resting the Scram 411 against the misty high-altitude mountain slopes. Gravel lines for days. #NortheastMotorsport'
  },
  {
    id: 'ig-3',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=500',
    likes: '1,204',
    comments: '67',
    caption: 'The golden hour intercept. Interceptor 650 parked beside the pine woods of Bomdila. #REInterceptor'
  },
  {
    id: 'ig-4',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=500',
    likes: '1,830',
    comments: '112',
    caption: 'Ascending the steep switchbacks with heavy cloud cover. Sela Pass road is ready! #RideHardNE'
  },
  {
    id: 'ig-5',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=500',
    likes: '745',
    comments: '29',
    caption: 'Mapping out the forest tracks near Ziro valley. Adventure is a state of mind! #MotorcycleDiary'
  },
  {
    id: 'ig-6',
    imageUrl: 'https://images.unsplash.com/photo-1533240332313-0db49b439ad3?auto=format&fit=crop&q=80&w=500',
    likes: '1,560',
    comments: '93',
    caption: 'Drenched in river spray and mud. The true test of high-clearance engineering! #RoyalEnfieldHimalayan'
  }
];

export default function InstagramGrid() {
  return (
    <section className="w-full bg-[#E2DFD9] text-rock py-24 px-4 md:px-8 border-b-2 border-rock" id="instagram-gallery">
      <div className="max-w-7xl mx-auto">
        
        {/* Title / Header */}
        <div className="mb-14 border-b-2 border-rock pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-xs font-mono font-black tracking-widest text-[#1B3C1F] uppercase">
              // FOLLOW OUR ADVENTURES ON INSTAGRAM
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black font-display tracking-tighter text-rock uppercase mt-2">
              @RIDEHARD_IN
            </h2>
          </div>
          <div className="flex items-center gap-2.5 font-mono text-xs text-rock bg-white p-3 border border-rock/20">
            <Instagram size={18} className="text-[#1B3C1F]" />
            <span>Tag <strong>#RideHardNE</strong> in your stories to get featured.</span>
          </div>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {INSTAGRAM_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-white border-2 border-rock p-4 hover:border-[#1B3C1F] transition-all group overflow-hidden flex flex-col justify-between brutallist-shadow"
            >
              {/* Image Container with Hover overlay */}
              <div className="relative aspect-square border-2 border-rock overflow-hidden bg-black shrink-0">
                <img
                  src={post.imageUrl}
                  alt={`${post.caption} - RideHard Northeast India motorcycle travel highlights`}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-mono font-black text-sm">
                  <span className="flex items-center gap-1.5 hover:text-[#1B3C1F] transition-colors">
                    <Heart size={18} fill="#1B3C1F" className="text-[#1B3C1F]" /> 
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white/80 transition-colors">
                    <MessageCircle size={18} fill="white" className="text-white" /> 
                    {post.comments}
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="pt-4 font-mono text-[11px] text-left leading-relaxed text-rock/80 flex-grow flex flex-col justify-between">
                <p className="line-clamp-2">"{post.caption}"</p>
                <div className="text-[#1B3C1F] font-bold mt-2.5 flex items-center gap-1">
                  <Instagram size={12} />
                  <span>VIEW POST ON INSTAGRAM</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
