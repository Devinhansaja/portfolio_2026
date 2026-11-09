// ============================================================
//  PORTFOLIO DATA — edit this file to change everything on the site.
//  Filled from Manitha_Devin_Hansaja_CV.pdf
// ============================================================
const PORTFOLIO = {
  fullName: "Manitha Devin Hansaja",
  firstName: "Devin",
  lastName: "Hansaja",
  roles: ["Video Editor", "Photographer", "Social Media Manager", "Web Developer"],
  tagline:
    "I edit scroll-stopping videos, shoot photos that tell stories and grow social media pages — and I build websites too.",
  location: "Ingiriya, Sri Lanka",
  available: true,
  photo: "assets/me-photo.webp", // transparent image looks best
  cvLink: "assets/Manitha_Devin_Hansaja_CV.pdf",

  // Loading screen shown before the site builds itself
  loader: {
    enabled: true,
    line1: "Tired of boring content?",
    line2: "Looking for an editor who tells stories?",
    line3: "You found him.",
    handle: "",
  },

  stats: [
    { value: 3, suffix: "+", label: "Years experience" },
    { value: 9, suffix: "+", label: "Videos & ads edited" },
    { value: 5, suffix: "", label: "Facebook pages managed" },
  ],

  // Filter tabs are created automatically from each project's "category".
  // "embed": shows the real website live inside the card (only works if the site allows iframes).
  projects: [
    {
      // glomaint.com blocks iframes, so this card uses a screenshot + link
      title: "Gloma International — Company Website",
      category: "Websites",
      year: "2026",
      role: "Web Designer & Developer",
      description:
        "Company website for Gloma International — web development, mobile apps, IT solutions, content creation, social media management, advertising and branding services.",
      tags: ["Vite", "Responsive Design", "Branding"],
      live: "https://www.glomaint.com/",
      liveLabel: "Visit site",
      github: "",
      image: "assets/project-glomaint.jpg",
      color: "#EF233C",
    },
    {
      title: "Elite Home Care Nursing",
      category: "Websites",
      year: "",
      role: "Web Designer",
      description:
        "Website for a premium home-care and nursing company — caregiving and nursing services for patients, the elderly, mothers and babies, with one-tap WhatsApp contact.",
      tags: ["React", "Vite", "Responsive Design"],
      live: "https://elitehomecarenursing.lk/",
      liveLabel: "Visit site",
      embed: "https://elitehomecarenursing.lk/",
      github: "",
      image: "assets/project-elite-homecare.jpg",
      color: "#DFE5EB",
    },
    {
      title: "GoNano — Nano Surface Protection",
      category: "Websites",
      year: "",
      role: "Web Designer",
      description:
        "Landing page for nano coatings and sealants for roofs, fences, concrete and brick — bold hero, free-estimate call to action and trust badges.",
      tags: ["Lovable", "Vite", "Landing Page"],
      live: "https://magic-mirror-art.lovable.app/",
      liveLabel: "Visit site",
      embed: "https://magic-mirror-art.lovable.app/",
      github: "",
      image: "assets/project-gonano.jpg",
      color: "#EF233C",
    },
    {
      // glomaloan.lk blocks iframes, so this card uses a screenshot + link instead of a live embed
      title: "Gloma Loan — Shop Microfinance Platform",
      category: "Web Apps",
      year: "",
      role: "Web Designer",
      description:
        "Daily business financing platform for shop owners in Sri Lanka — loan applications, eligibility checks, daily collection and instalment management, in English, Sinhala and Tamil.",
      tags: ["Next.js", "React", "Multi-language"],
      live: "https://glomaloan.lk/",
      liveLabel: "Visit site",
      github: "",
      image: "assets/project-glomaloan.jpg",
      color: "#DFE5EB",
    },
    {
      title: "Focus Photography",
      category: "Photo & Video",
      year: "",
      role: "Founder",
      description:
        "My photography brand for events, parties, engagements, weddings and fashion — capturing moments and elevating them through expert editing.",
      tags: ["Photography", "Videography", "Editing"],
      live: "https://web.facebook.com/profile.php?id=61555425576942",
      liveLabel: "View on Facebook",
      github: "",
      image: "assets/project-focus-photography.jpg",
      color: "#EF233C",
    },
    {
      title: "Wedding Videography",
      category: "Photo & Video",
      year: "",
      role: "Videographer & Editor",
      description: "Cinematic wedding films shot and edited for Focus Photography clients.",
      tags: ["Videography", "DaVinci Resolve", "Colour Grading"],
      live: "https://web.facebook.com/profile.php?id=61555425576942",
      liveLabel: "View on Facebook",
      github: "",
      image: "assets/project-wedding-video.jpg",
      imagePos: "center 75%", // which part of the image to show
      color: "#DFE5EB",
    },
    {
      title: "Portrait & Fashion Editing",
      category: "Photo & Video",
      year: "",
      role: "Photographer & Editor",
      description: "Portrait and fashion shoots retouched and colour-graded for social media.",
      tags: ["Photography", "Lightroom", "Adobe Photoshop"],
      live: "https://web.facebook.com/profile.php?id=61555425576942",
      liveLabel: "View on Facebook",
      github: "",
      image: "assets/project-photo-editing.jpg",
      imagePos: "center 70%",
      color: "#EF233C",
    },
  ],

  // Reels / video ads section (vertical 9:16 videos). Files live in assets/reels/
  reels: [
    { title: "Ceylon Trust — Bank Statements for Visas", client: "Ceylon Trust Cooperation", length: "0:39", video: "assets/reels/ceylon-trust-ad.mp4", poster: "assets/reels/ceylon-trust-ad.jpg" },
    { title: "Russel's Tea — Order Now", client: "Russels Dimbula Tea", length: "0:41", video: "assets/reels/russels-tea-order-ad.mp4", poster: "assets/reels/russels-tea-order-ad.jpg" },
    { title: "MAS — Sri Pada Clean-up 2026", client: "MAS Bodyline", length: "3:42", video: "assets/reels/mas-sripada-cleanup.mp4", poster: "assets/reels/mas-sripada-cleanup.jpg" },
    { title: "The Dark — AI Film, Part 1", client: "AI video", length: "1:21", video: "assets/reels/ai-the-dark.mp4", poster: "assets/reels/ai-the-dark.jpg" },
    { title: "Planet Protectors — Avurudu Wish", client: "Planet Protectors", length: "0:44", video: "assets/reels/planet-protectors-avurudu.mp4", poster: "assets/reels/planet-protectors-avurudu.jpg", wide: true, focus: "45% center" },
    { title: "MAS — Honouring the Craft", client: "MAS Bodyline", length: "0:21", video: "assets/reels/mas-exhibition.mp4", poster: "assets/reels/mas-exhibition.jpg" },
    { title: "Elite Home Care — Service Ad", client: "Elite Home Care Nursing", length: "0:41", video: "assets/reels/elite-service-ad.mp4", poster: "assets/reels/elite-service-ad.jpg" },
    { title: "Elite Home Care — Brand Ad", client: "Elite Home Care Nursing", length: "0:42", video: "assets/reels/elite-brand-ad.mp4", poster: "assets/reels/elite-brand-ad.jpg" },
    { title: "Taxi App — Investor Pitch", client: "Taxi App", length: "1:01", video: "assets/reels/taxi-app-ad.mp4", poster: "assets/reels/taxi-app-ad.jpg" },
    { title: "ICET — Choose Your Profession", client: "ICET Institute", length: "2:02", video: "assets/reels/icet-career-promo.mp4", poster: "assets/reels/icet-career-promo.jpg" },
    { title: "PTE Solution — Course Promo", client: "PTE Solution", length: "1:22", video: "assets/reels/pte-course-promo.mp4", poster: "assets/reels/pte-course-promo.jpg" },
    { title: "PTE Solution — Student Ad", client: "PTE Solution", length: "1:42", video: "assets/reels/pte-student-ad.mp4", poster: "assets/reels/pte-student-ad.jpg" },
    { title: "PTE Tips — Repeat Sentences", client: "PTE Solution", length: "0:29", video: "assets/reels/pte-repeat-sentences.mp4", poster: "assets/reels/pte-repeat-sentences.jpg" },
  ],

  // Editing tools — logos that move left to right under the reels
  editTools: [
    { name: "Adobe Premiere Pro", logo: "assets/tools/premiere-pro.svg" },
    { name: "After Effects", logo: "assets/tools/after-effects.svg" },
    { name: "Illustrator", logo: "assets/tools/illustrator.svg" },
    { name: "Photoshop", logo: "assets/tools/photoshop.svg" },
    { name: "DaVinci Resolve", logo: "assets/tools/davinci-resolve.svg" },
    { name: "CapCut", logo: "assets/tools/capcut.svg" },
  ],

  // Landscape (16:9) films shown under the reels, e.g. wedding films. Files live in assets/reels/
  films: [
    { title: "Wedding Film — Ceremony Highlights", client: "Focus Photography", length: "4:24", video: "assets/reels/wedding-film-1.mp4", poster: "assets/reels/wedding-film-1.jpg" },
    { title: "Wedding Film — The Celebration", client: "Focus Photography", length: "4:26", video: "assets/reels/wedding-film-2.mp4", poster: "assets/reels/wedding-film-2.jpg" },
  ],

  // Long-form YouTube videos (shown under the reels). Paste normal YouTube links; playlist links work too.
  youtube: [
    {
      title: "👁️අක්ෂි රෝගවලට නිවැරදි ප්‍රතිකාර මොනවාද?",
      channel: "PROFIT TV",
      url: "https://youtu.be/U59IeysDWNg",
    },
    {
      title: "🌿 නගරයක් මැද හරිතාගාර වගාවක් | City Green Agro",
      channel: "PROFIT TV",
      url: "https://youtu.be/tuF73ePpSts",
    },
    {
      title: "ස්කූටරය සහ කාන්තාව | මඩ ගහන්න කලින් මේ ටිකත් හිතන්න — Episode 01",
      channel: "HER with Kalasi · ඇය වෙනුවෙන්",
      url: "https://www.youtube.com/watch?v=mRhkilTnktI&list=PLDqGAncz_KxfJ-IEhdfzqsAfEzL-uPWZZ",
    },
    {
      title: "සසරින් එතෙරවෙන මාර්ගය සොයාගෙන මහණ දිවියට පැමිණි ඇගේ කතාව — Episode 07",
      channel: "HER with Kalasi · ඇය වෙනුවෙන්",
      url: "https://www.youtube.com/watch?v=UKOQNram33Q",
    },
  ],

  // Facebook pages I manage — shown as cards with each page's logo
  pages: [
    { name: "Upali Pooja Bhanda", url: "https://www.facebook.com/profile.php?id=100063587616190", logo: "assets/clients/upali.webp" },
    { name: "Russel's Tea Services and Catering", url: "https://www.facebook.com/russelscatering", logo: "assets/clients/russels-catering.webp" },
    { name: "Russels Dimbula Tea and Ceylon Spices", url: "https://www.facebook.com/russelsdimbulateaandceylonspices/", logo: "assets/clients/russels-tea.webp" },
    { name: "Russel Francis Perera", url: "https://www.facebook.com/profile.php?id=61586921127253", logo: "assets/pages/russel-francis.webp" },
    { name: "ELITE Home Care Nursing", url: "https://www.facebook.com/profile.php?id=61574318894374", logo: "assets/clients/elite.webp" },
  ],

  // "From wireframe to real" slider — sketch = the wireframe, real = screenshot of the live site.
  // Both images should be the same size. Add more items to get tabs.
  // The section is hidden while this list is empty. Example item:
  // { name: "Elite Home Care Nursing", url: "https://elitehomecarenursing.lk/", sketch: "assets/wireframe-elite.jpg", real: "assets/real-elite.jpg" }
  compare: [],

  // Logos scroll from left to right in the "Been part of the bigger picture" strip. Square logos look best.
  clients: [
    { name: "Gloma International", logo: "assets/clients/gloma.webp" },
    { name: "MAS Bodyline", logo: "assets/clients/mas.webp" },
    { name: "Upali Pooja Bhanda", logo: "assets/clients/upali.webp" },
    { name: "La Villa Hotel", logo: "assets/clients/lavilla.webp" },
    { name: "Elite Home Care", logo: "assets/clients/elite.webp" },
    { name: "Russel's Catering", logo: "assets/clients/russels-catering.webp" },
    { name: "Russels Dimbula Tea", logo: "assets/clients/russels-tea.webp" },
    { name: "Focus Photography", logo: "assets/clients/focus.webp" },
  ],

  // Achievements section is hidden while this list is empty.
  // To bring it back, add items like: { badge: "1st Dan", title: "Karate — Black Belt", org: "Martial arts" }
  awards: [],

  // Education is hidden while this list is empty. To show it again, add items like:
  // { period: "2022 — 2024", title: "Diploma in IT Engineering", place: "IUHS Campus, Galle" }
  education: [],

  // Most important first — the first ones also lead the scrolling banner
  skills: [
    "Video Editing", "Photography", "Social Media Management", "Videography",
    "Video & AI Filmmaking", "Social Media Marketing", "Content Creation", "Colour Grading",
    "Graphic Design", "Branding", "UI/UX Design", "Web Development", "Mobile App Development",
  ],

  // Shown as "Tools I use"
  tools: [
    "DaVinci Resolve", "Lightroom", "Adobe Apps", "Meta Business Suite", "Illustrator", "Figma",
    "HTML", "CSS", "JavaScript", "React.js", "Kotlin", "Flutter", "PHP", "MySQL", "Firebase", "VS Code",
  ],

  process: [
    { title: "The Brief", text: "Understand the brand, the audience and the story to tell." },
    { title: "The Plan", text: "Plan the shots, scripts, posts and content calendar." },
    { title: "The Shoot", text: "Capture photos and video — on location, in studio or with AI." },
    { title: "The Edit", text: "Cut, colour-grade, add motion and sound until every frame works." },
    { title: "The Launch", text: "Publish, run the ads, read the numbers and keep growing the page." },
  ],

  quote: "Stories that stop the scroll — shot, edited and shared to grow your brand.",

  // Photography gallery — hidden while this list is empty. Add photos in the admin panel to bring it back.
  photos: [],

  // Photoshoots: each one is a frame whose photos change by themselves (used while "photos" is empty).
  // url = the Facebook post (optional). Photos live in assets/shoots/<name>/
  photoshoots: [
    { title: "Kalasi Ranshara", category: "Studio portrait shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0287onAZnPoG6zB5t3C8qnwu732TZUqmT5ahXXG4xbw7t1Q3SNCkbvz5PY147jMbUyl&id=61555425576942",
      photos: [{ src: "assets/shoots/kalasi/01.webp" }, { src: "assets/shoots/kalasi/02.webp" }, { src: "assets/shoots/kalasi/03.webp" }, { src: "assets/shoots/kalasi/04.webp" }, { src: "assets/shoots/kalasi/05.webp" }, { src: "assets/shoots/kalasi/06.webp" }, { src: "assets/shoots/kalasi/07.webp" }, { src: "assets/shoots/kalasi/08.webp" }, { src: "assets/shoots/kalasi/09.webp" }, { src: "assets/shoots/kalasi/10.webp" }] },
    { title: "Gihani Madhubhashini", category: "Portrait shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid0FSk8h8iXgH8A3aQCisDQYXT7k6E86RM41S5j8vArHVvkP3RW4AcFW8onv85se4bTl&id=61555425576942",
      photos: [{ src: "assets/shoots/gihani/01.webp" }, { src: "assets/shoots/gihani/02.webp" }, { src: "assets/shoots/gihani/03.webp" }, { src: "assets/shoots/gihani/04.webp" }, { src: "assets/shoots/gihani/05.webp" }, { src: "assets/shoots/gihani/06.webp" }] },
    { title: "Tharushi Sandeepani", category: "Traditional portrait shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02WGfTRibnE6CEr3WTkxBwnxwFfHcHUpX9WricYQ6y6DWEGrR2c935S2Zhp69KfBd2l&id=61555425576942",
      photos: [{ src: "assets/shoots/tharushi/01.webp" }, { src: "assets/shoots/tharushi/02.webp" }, { src: "assets/shoots/tharushi/03.webp" }, { src: "assets/shoots/tharushi/04.webp" }, { src: "assets/shoots/tharushi/05.webp" }, { src: "assets/shoots/tharushi/06.webp" }, { src: "assets/shoots/tharushi/07.webp" }, { src: "assets/shoots/tharushi/08.webp" }, { src: "assets/shoots/tharushi/09.webp" }, { src: "assets/shoots/tharushi/10.webp" }] },
    { title: "Kavin Amarasingha", category: "Lifestyle shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02qcFaGMNJRYMzqdZsCQWQZa52sQekQwAEiH2Y4hcTn1iEiutbxH5QLqzHSCziFv8Sl&id=61555425576942",
      photos: [{ src: "assets/shoots/kavin/02.webp" }, { src: "assets/shoots/kavin/03.webp" }, { src: "assets/shoots/kavin/04.webp" }, { src: "assets/shoots/kavin/05.webp" }, { src: "assets/shoots/kavin/06.webp" }, { src: "assets/shoots/kavin/07.webp" }, { src: "assets/shoots/kavin/08.webp" }, { src: "assets/shoots/kavin/09.webp" }, { src: "assets/shoots/kavin/10.webp" }, { src: "assets/shoots/kavin/01.webp" }] },
    { title: "Kavin — Turning 22", category: "Birthday shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02wcXGbRaV9spmUzBdLt4E63mrABjE4hkWcErKo8PpXJ6icAba1CfH8yyX6PYngWS6l&id=61555425576942",
      photos: [{ src: "assets/shoots/kavin22/01.webp" }, { src: "assets/shoots/kavin22/02.webp" }, { src: "assets/shoots/kavin22/03.webp" }, { src: "assets/shoots/kavin22/04.webp" }, { src: "assets/shoots/kavin22/05.webp" }] },
    { title: "Shashi De Silva", category: "Outdoor portrait shoot", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02e4FKKkRs2v3SSqE6LK78xTSAnvtripqbnNEdaNMVQ6T3Z5zubxrUuWwVWzrGpHSFl&id=61555425576942",
      photos: [{ src: "assets/shoots/shashi/01.webp" }, { src: "assets/shoots/shashi/02.webp" }, { src: "assets/shoots/shashi/03.webp" }, { src: "assets/shoots/shashi/04.webp" }, { src: "assets/shoots/shashi/05.webp" }, { src: "assets/shoots/shashi/06.webp" }] },
    { title: "IUHS — Vigadama", category: "Event coverage", url: "https://www.facebook.com/permalink.php?story_fbid=pfbid02eTjAdKhQdhKpjubnAefEpN9RQmzg2yYRfZE3PfNVVXSjoiB652JjHF5q53eAPXjxl&id=61555425576942",
      photos: [{ src: "assets/shoots/iuhs/01.webp" }, { src: "assets/shoots/iuhs/02.webp" }, { src: "assets/shoots/iuhs/03.webp" }, { src: "assets/shoots/iuhs/04.webp" }, { src: "assets/shoots/iuhs/05.webp" }, { src: "assets/shoots/iuhs/06.webp" }, { src: "assets/shoots/iuhs/07.webp" }, { src: "assets/shoots/iuhs/08.webp" }, { src: "assets/shoots/iuhs/09.webp" }, { src: "assets/shoots/iuhs/10.webp" }] },
  ],  photoLink: "https://web.facebook.com/profile.php?id=61555425576942", // "See more" link (Focus Photography)

  journey: [
    {
      period: "Apr 2026 — Present",
      role: "Social Media Marketer & Developer",
      company: "Gloma International",
      logo: "assets/clients/gloma.webp",
      text: "Plan and run social and paid campaigns that drive visibility, engagement and leads, and build the web solutions those campaigns land on.",
    },
    {
      period: "2025 — Present",
      role: "Graphic Design Intern — Branding & Communication",
      company: "MAS Bodyline (Pvt) Ltd, Agalawatta",
      logo: "assets/clients/mas.webp",
      text: "Support branding and communication design, create visual assets to brand guidelines, and handle photography and videography.",
    },
    {
      period: "2024 — Present",
      role: "Graphic Designer (Remote)",
      company: "Upali Pooja Bhanda (Pvt) Ltd, Horana",
      logo: "assets/clients/upali.webp",
      text: "Design digital creatives for social media and promotions, helping improve the online brand presence.",
    },
    {
      period: "2024 — 2025",
      role: "Graphic Designer & Content Creator",
      company: "La Villa Hotel, Ingiriya",
      logo: "assets/clients/lavilla.webp",
      text: "Designed promotional posters and marketing visuals, and created digital content for hotel branding and campaigns.",
    },
    {
      period: "2024 — 2025",
      role: "Computer Operator",
      company: "Upali Pooja Bhanda (Pvt) Ltd, Horana",
      logo: "assets/clients/upali.webp",
      text: "Handled transaction records and billing entries, verified data for error-free daily operations and supported reporting.",
    },
  ],

  contact: {
    email: "devinhansaja100@gmail.com",
    phone: "+94 70 376 6481",
    whatsapp: "94703766481", // digits only, used for wa.me link
    socials: [
      { name: "LinkedIn", url: "https://www.linkedin.com/in/devin-hansaja-0a836b2b6/" },
      { name: "GitHub", url: "https://github.com/Devinhansaja" },
      { name: "Instagram", url: "https://www.instagram.com/hansajadevin" },
      { name: "Facebook", url: "https://web.facebook.com/devin.hansaja.5" },
      { name: "Focus Photography", url: "https://web.facebook.com/profile.php?id=61555425576942" },
    ],
  },
};
