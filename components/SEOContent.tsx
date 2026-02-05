'use client';

import { useState } from 'react';

export default function SEOContent() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className={`fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent transition-all duration-500 ${
        isExpanded ? 'h-[85vh] overflow-y-auto' : 'h-auto'
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
          aria-expanded={isExpanded}
          aria-controls="seo-content"
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Hide' : 'Learn About'} Solar System Exploration
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div
          id="seo-content"
          className={`prose prose-invert prose-lg max-w-none ${isExpanded ? 'block' : 'hidden'}`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Orbit Command: Your Free Interactive 3D Solar System Simulator
          </h1>

          <p className="text-white/80 leading-relaxed">
            Welcome to Orbit Command, the most advanced free 3D solar system simulator available online today. Our interactive space exploration tool brings the entire solar system directly to your screen with scientifically accurate planetary positions updated in real-time. Whether you are a student learning about astronomy for the first time, an educator teaching space science to curious minds, a parent looking for educational tools, or simply someone curious about our cosmic neighborhood, Orbit Command makes understanding the universe simple, engaging, and genuinely fun.
          </p>

          <p className="text-white/80 leading-relaxed">
            Unlike static images in textbooks or complicated planetarium software that requires installation, Orbit Command runs entirely in your web browser. No downloads. No registration. No payment. Just pure space exploration at your fingertips. Our mission is simple: make astronomy accessible to everyone on Earth, regardless of age, location, or technical expertise.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            Understanding Our Solar System: A Complete Guide
          </h2>

          <p className="text-white/80 leading-relaxed">
            Our solar system formed approximately 4.6 billion years ago from a giant molecular cloud of gas and dust called a solar nebula. Gravity pulled this material together, and at the center, temperatures and pressures became so extreme that nuclear fusion ignited, creating our Sun. The remaining material flattened into a disk and eventually coalesced into the planets, moons, asteroids, and comets we observe today.
          </p>

          <p className="text-white/80 leading-relaxed">
            At the center of everything sits the Sun, a yellow dwarf star classified as a G-type main-sequence star. The Sun contains approximately 99.86 percent of all mass in our entire solar system. To put this in perspective, you could fit about 1.3 million Earths inside the Sun. Its surface temperature reaches about 5,500 degrees Celsius, while its core burns at an incredible 15 million degrees Celsius. The Sun produces energy through nuclear fusion, converting hydrogen into helium and releasing enormous amounts of light and heat that make life on Earth possible.
          </p>

          <p className="text-white/80 leading-relaxed">
            Eight planets orbit this massive star, each with unique characteristics that make them fascinating subjects for study and exploration. Scientists divide these planets into two main categories based on their composition and location within the solar system.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            The Inner Rocky Planets: Terrestrial Worlds
          </h3>

          <p className="text-white/80 leading-relaxed">
            The four inner planets, Mercury, Venus, Earth, and Mars, are called terrestrial or rocky planets. These worlds have solid surfaces composed primarily of silicate rocks and metals. They formed closer to the Sun where temperatures were too high for volatile compounds like water and methane to condense into solids.
          </p>

          <p className="text-white/80 leading-relaxed">
            Mercury, the smallest planet and closest to the Sun, completes an orbit in just 88 Earth days. Despite its proximity to the Sun, Mercury is not the hottest planet because it lacks a substantial atmosphere to trap heat. Its surface experiences extreme temperature swings, from 430 degrees Celsius during the day to minus 180 degrees Celsius at night.
          </p>

          <p className="text-white/80 leading-relaxed">
            Venus, often called Earth&apos;s sister planet due to its similar size, is actually the hottest planet in our solar system. Its thick atmosphere of carbon dioxide creates a runaway greenhouse effect, trapping heat and raising surface temperatures to about 465 degrees Celsius. Venus rotates backward compared to most planets, meaning the Sun rises in the west and sets in the east.
          </p>

          <p className="text-white/80 leading-relaxed">
            Earth, our home, is the only planet known to harbor life. Its unique combination of liquid water, protective atmosphere, and magnetic field creates conditions suitable for the incredible diversity of life we see today. Earth&apos;s Moon, formed about 4.5 billion years ago from a giant impact, stabilizes our planet&apos;s axial tilt and creates the tides.
          </p>

          <p className="text-white/80 leading-relaxed">
            Mars, the Red Planet, has captured human imagination for centuries. Its rusty color comes from iron oxide on its surface. Mars has the largest volcano in the solar system, Olympus Mons, standing about 22 kilometers high. Scientists have found evidence of ancient water on Mars, making it a prime target for future human exploration and the search for past microbial life.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            The Outer Gas Giants: Worlds of Hydrogen and Helium
          </h3>

          <p className="text-white/80 leading-relaxed">
            Beyond Mars lies the asteroid belt, and past that, we find the four outer planets: Jupiter, Saturn, Uranus, and Neptune. These massive worlds are called gas giants or ice giants, and they lack solid surfaces. Instead, their atmospheres gradually become denser with depth until they transition into liquid or metallic states.
          </p>

          <p className="text-white/80 leading-relaxed">
            Jupiter, the largest planet, could fit all other planets inside it with room to spare. Its mass is about 318 times that of Earth. Jupiter&apos;s Great Red Spot is a storm that has raged for at least 400 years, large enough to swallow Earth whole. Jupiter has at least 95 known moons, including the four large Galilean moons discovered by Galileo in 1610: Io, Europa, Ganymede, and Callisto. Europa is particularly interesting because scientists believe it has a liquid water ocean beneath its icy surface.
          </p>

          <p className="text-white/80 leading-relaxed">
            Saturn, famous for its spectacular ring system, is the second-largest planet. Its rings are made primarily of ice particles ranging from tiny grains to house-sized chunks. Saturn is so light relative to its size that it would float in water if you could find a bathtub big enough. Its moon Titan has a thick atmosphere and liquid methane lakes on its surface, making it one of the most Earth-like worlds in our solar system despite its frigid temperatures.
          </p>

          <p className="text-white/80 leading-relaxed">
            Uranus and Neptune are classified as ice giants because they contain more water, ammonia, and methane than Jupiter and Saturn. Uranus rotates on its side, likely due to a massive collision early in its history. Neptune, the windiest planet, has storms with wind speeds exceeding 2,000 kilometers per hour. Both planets appear blue due to methane in their atmospheres absorbing red light.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Planet Distances and the Scale of Space
          </h3>

          <p className="text-white/80 leading-relaxed">
            Space is incredibly vast, far beyond what our everyday experience prepares us to comprehend. Astronomers use a special unit called the Astronomical Unit to measure distances within our solar system. One AU equals the average distance from Earth to the Sun, approximately 93 million miles or 150 million kilometers. Light itself takes about 8 minutes and 20 seconds to travel this distance.
          </p>

          <ul className="text-white/80 space-y-2 my-4">
            <li><strong>Mercury:</strong> 0.39 AU (36 million miles) from the Sun, orbits in 88 Earth days</li>
            <li><strong>Venus:</strong> 0.72 AU (67 million miles) from the Sun, orbits in 225 Earth days</li>
            <li><strong>Earth:</strong> 1.0 AU (93 million miles) from the Sun, orbits in 365.25 days</li>
            <li><strong>Mars:</strong> 1.52 AU (142 million miles) from the Sun, orbits in 687 Earth days</li>
            <li><strong>Jupiter:</strong> 5.2 AU (483 million miles) from the Sun, orbits in 11.86 Earth years</li>
            <li><strong>Saturn:</strong> 9.54 AU (886 million miles) from the Sun, orbits in 29.46 Earth years</li>
            <li><strong>Uranus:</strong> 19.2 AU (1.78 billion miles) from the Sun, orbits in 84 Earth years</li>
            <li><strong>Neptune:</strong> 30.1 AU (2.8 billion miles) from the Sun, orbits in 165 Earth years</li>
          </ul>

          <p className="text-white/80 leading-relaxed">
            To truly grasp these distances, consider this: if you could drive a car at highway speed directly to the Sun, it would take over 170 years. Driving to Neptune would take more than 5,000 years. The Voyager 1 spacecraft, traveling at about 17 kilometers per second, took 12 years just to reach Neptune&apos;s orbit.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            How Orbit Command Works: Technology Behind the Simulation
          </h2>

          <p className="text-white/80 leading-relaxed">
            Orbit Command uses advanced WebGL technology and the Three.js rendering library to create a stunning, interactive 3D visualization of our solar system. WebGL allows your web browser to render complex 3D graphics using your computer&apos;s graphics processing unit, delivering smooth performance without requiring any plugins or downloads.
          </p>

          <p className="text-white/80 leading-relaxed">
            The application calculates real planetary positions using established astronomical algorithms based on Keplerian orbital mechanics. These calculations account for each planet&apos;s orbital period, eccentricity, inclination, and other parameters. This means when you look at Jupiter in Orbit Command, you see where Jupiter actually is in the sky right now, not just an approximation.
          </p>

          <p className="text-white/80 leading-relaxed">
            Our time control feature lets you travel through time in both directions. Speed up the simulation to watch planets complete their orbits in seconds. Slow down to observe the precise movements of inner planets like Mercury. Jump to specific dates to see historical planetary alignments or plan your future stargazing sessions. You can even witness events like planetary conjunctions, oppositions, and transits.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Key Features for Space Enthusiasts
          </h3>

          <ul className="text-white/80 space-y-2 my-4">
            <li><strong>Real-Time Tracking:</strong> See exactly where each planet is positioned right now based on actual astronomical data</li>
            <li><strong>Time Travel:</strong> Explore past and future planetary positions with intuitive time controls</li>
            <li><strong>Cinematic Tours:</strong> Enjoy automated flyby sequences that take you on guided tours of each planet</li>
            <li><strong>Educational Data:</strong> Access detailed information and fascinating facts about each celestial body</li>
            <li><strong>Mobile Friendly:</strong> Works seamlessly on phones, tablets, laptops, and desktop computers</li>
            <li><strong>No Download Required:</strong> Runs entirely in your web browser with no installation needed</li>
            <li><strong>Keyboard Shortcuts:</strong> Power users can navigate quickly using keyboard commands</li>
            <li><strong>Accurate Scale Options:</strong> Toggle between visually appealing and astronomically accurate scales</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            Getting Started with Astrophotography: Capture the Night Sky
          </h2>

          <p className="text-white/80 leading-relaxed">
            Many visitors to Orbit Command develop a deeper interest in astronomy and want to capture the night sky themselves. Astrophotography has become increasingly accessible thanks to advances in digital camera technology and image processing software. You do not need expensive professional equipment to start photographing stars, planets, the Milky Way, and other celestial wonders.
          </p>

          <p className="text-white/80 leading-relaxed">
            The key to successful astrophotography lies in understanding a few fundamental principles: gathering enough light, minimizing camera shake, and choosing the right targets for your equipment level. With patience and practice, anyone can capture stunning images of the cosmos.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Essential Equipment for Beginner Astrophotographers
          </h3>

          <p className="text-white/80 leading-relaxed">
            A DSLR or mirrorless camera with manual controls forms the foundation of any astrophotography setup. Look for cameras that perform well at high ISO settings, as you will often shoot at ISO 1600 to 6400 or even higher. Full-frame sensors capture more light and produce less noise, but crop-sensor cameras work excellently for beginners and cost significantly less. Many stunning astrophotography images have been captured with entry-level cameras.
          </p>

          <p className="text-white/80 leading-relaxed">
            For wide-field shots of the Milky Way, star trails, and meteor showers, use a wide-angle lens with a large aperture. Lenses with f/2.8 or wider apertures gather more light in shorter exposures, reducing star trailing. Popular choices include 14mm, 20mm, and 24mm focal lengths. A sturdy tripod is absolutely essential, as even slight vibrations during long exposures will ruin your images.
          </p>

          <p className="text-white/80 leading-relaxed">
            For planetary and lunar photography, you will want a telephoto lens or telescope. Even a 200mm or 300mm lens can capture impressive detail on the Moon. For planets like Jupiter and Saturn, longer focal lengths and specialized planetary cameras yield the best results. Many astrophotographers start with wide-field imaging and gradually expand into deep-sky and planetary work.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Camera Settings for Night Sky Photography
          </h3>

          <ul className="text-white/80 space-y-2 my-4">
            <li><strong>Shooting Mode:</strong> Manual mode gives you complete control over all settings</li>
            <li><strong>Focus:</strong> Use manual focus and set it to infinity, then fine-tune using live view on a bright star</li>
            <li><strong>Aperture:</strong> Open as wide as possible, typically f/2.8 or lower</li>
            <li><strong>ISO:</strong> Start at 1600 to 3200 and adjust based on light pollution and noise levels</li>
            <li><strong>Shutter Speed:</strong> Use the 500 rule as a starting point: divide 500 by your focal length for maximum exposure time in seconds before stars trail</li>
            <li><strong>File Format:</strong> Always shoot in RAW format for maximum editing flexibility in post-processing</li>
            <li><strong>White Balance:</strong> Set to daylight or auto; you can adjust this later when editing RAW files</li>
            <li><strong>Long Exposure Noise Reduction:</strong> Consider disabling this to save time; you can reduce noise in post-processing</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            Planning Your Observation Sessions
          </h2>

          <p className="text-white/80 leading-relaxed">
            Successful astronomy observation requires careful planning. Use Orbit Command to identify which planets are visible on any given night and where they will appear in the sky. Check the positions of planets relative to the Sun in our simulation. Planets that appear near the Sun in Orbit Command will be close to the horizon at sunrise or sunset in real life, making them difficult to observe.
          </p>

          <p className="text-white/80 leading-relaxed">
            Light pollution significantly affects what you can see and photograph. Urban areas wash out faint stars, nebulae, and galaxies with artificial light. For the best views of the Milky Way and deep-sky objects, travel to dark sky locations away from city lights. Many national parks, rural areas, and designated dark sky preserves offer excellent stargazing conditions. Websites and apps can help you find dark sky locations near you.
          </p>

          <p className="text-white/80 leading-relaxed">
            Moon phase matters tremendously for deep-sky observation and photography. A bright Moon washes out faint objects just like city lights. Plan your deep-sky sessions around the new Moon when the sky is darkest. However, the Moon itself makes an excellent target during other phases, and planets can be observed regardless of Moon phase.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Best Times for Planet Viewing
          </h3>

          <p className="text-white/80 leading-relaxed">
            Planets appear brightest and largest when they reach opposition, the point in their orbit where Earth passes between the planet and the Sun. At opposition, a planet rises at sunset and remains visible all night, reaching its highest point in the sky around midnight. Use Orbit Command&apos;s time controls to find upcoming oppositions for Mars, Jupiter, Saturn, Uranus, and Neptune.
          </p>

          <p className="text-white/80 leading-relaxed">
            Venus and Mercury, being closer to the Sun than Earth, never reach opposition. Instead, they appear as evening or morning stars, visible shortly after sunset or before sunrise. Venus can become incredibly bright, sometimes visible even in daylight if you know exactly where to look. Mercury is more challenging to observe due to its proximity to the Sun but can be spotted during favorable elongations.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            Educational Applications: Orbit Command in the Classroom
          </h2>

          <p className="text-white/80 leading-relaxed">
            Teachers and educators worldwide use Orbit Command as a powerful classroom tool. The visual, interactive nature of our 3D solar system model helps students understand concepts that static textbook images struggle to convey. Seeing planetary orbits in motion makes abstract ideas concrete, memorable, and genuinely exciting for learners of all ages.
          </p>

          <p className="text-white/80 leading-relaxed">
            Students can explore fundamental questions through hands-on investigation: Why do inner planets orbit faster than outer planets? How do orbital periods relate to distance from the Sun? What causes the seasons on Earth? Why do we see different constellations at different times of year? Orbit Command provides intuitive answers through interactive exploration rather than rote memorization.
          </p>

          <h3 className="text-xl font-semibold text-white mt-6 mb-3">
            Curriculum Integration Ideas for Educators
          </h3>

          <ul className="text-white/80 space-y-2 my-4">
            <li>Compare orbital periods of different planets and discover Kepler&apos;s laws</li>
            <li>Measure relative distances using the Astronomical Unit scale</li>
            <li>Predict planetary positions for future dates and verify predictions</li>
            <li>Study historical astronomical events like eclipses and conjunctions</li>
            <li>Understand the true scale of our solar system compared to everyday distances</li>
            <li>Explore how ancient civilizations tracked planetary movements</li>
            <li>Investigate why planets appear to move backward during retrograde motion</li>
            <li>Calculate how long space missions take to reach different planets</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            The Future of Space Exploration
          </h2>

          <p className="text-white/80 leading-relaxed">
            Humanity stands at an exciting crossroads in space exploration. Multiple space agencies and private companies are planning ambitious missions to the Moon, Mars, and beyond. NASA&apos;s Artemis program aims to return humans to the lunar surface and establish a sustainable presence there. SpaceX continues developing Starship for eventual Mars colonization. The European Space Agency, JAXA, ISRO, and other organizations contribute to our expanding presence in space.
          </p>

          <p className="text-white/80 leading-relaxed">
            Robotic missions continue to reveal new wonders throughout our solar system. The James Webb Space Telescope provides unprecedented views of distant galaxies and exoplanets. Mars rovers explore the Red Planet&apos;s surface searching for signs of ancient life. Missions to Europa and Enceladus may soon investigate whether life exists in the subsurface oceans of these icy moons.
          </p>

          <p className="text-white/80 leading-relaxed">
            Understanding our solar system becomes increasingly important as we venture further from Earth. Tools like Orbit Command help build public interest and scientific literacy. When more people understand and appreciate space, support for exploration missions grows. Today&apos;s curious students using Orbit Command may become tomorrow&apos;s astronauts, engineers, and scientists pushing the boundaries of human knowledge.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">
            Start Your Space Exploration Journey Today
          </h2>

          <p className="text-white/80 leading-relaxed">
            Orbit Command requires no registration, no download, and no payment. Simply use your mouse or touch screen to navigate through our solar system. Click or tap on any planet to learn more about it and see detailed information. Use the time controls to watch orbital mechanics in action and explore any date in history or the future. Share your discoveries with friends, family, students, or colleagues.
          </p>

          <p className="text-white/80 leading-relaxed">
            The universe awaits your exploration. Every great astronomer, astronaut, and space scientist started with simple curiosity about the night sky. Galileo pointed a small telescope at Jupiter and discovered its moons. Kepler studied planetary motions and uncovered the laws governing orbits. Hubble revealed that our galaxy is just one of billions. Let Orbit Command be your first step toward understanding the cosmos that surrounds us all.
          </p>

          <p className="text-white/80 leading-relaxed">
            The same stars and planets that inspired ancient astronomers, guided sailors across oceans, and sparked the imaginations of countless generations shine above you tonight. Look up. Wonder. Explore. The universe is waiting.
          </p>

          <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">
              Ready to Begin Your Cosmic Journey?
            </h3>
            <p className="text-white/80 mb-4">
              Close this panel and start exploring the solar system right now. Use your mouse to rotate the view, scroll to zoom in and out, and click on any planet to learn more about it. Press the K key to open the command palette for quick access to all features. The entire solar system is at your fingertips.
            </p>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              Start Exploring the Solar System
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
