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
      color: "#1558C9",
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
      color: "#D4FF24",
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
      color: "#1558C9",
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
      color: "#D4FF24",
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
      color: "#1558C9",
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
      color: "#D4FF24",
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
      color: "#1558C9",
    },
    {
      title: "Nextera Team — Interface Design",
      category: "UI/UX",
      year: "",
      role: "Member & UI/UX Designer",
      description: "Designing user interfaces and user flows as part of the Nextera team.",
      tags: ["UI/UX Design", "Web", "Mobile"],
      live: "",
      github: "",
      image: "",
      color: "#D4FF24",
    },
  ],

  // Reels / video ads section (vertical 9:16 videos). Files live in assets/reels/
  reels: [
    { title: "Elite Home Care — Service Ad", client: "Elite Home Care Nursing", length: "0:41", video: "assets/reels/elite-service-ad.mp4", poster: "assets/reels/elite-service-ad.jpg" },
    { title: "Elite Home Care — Brand Ad", client: "Elite Home Care Nursing", length: "0:42", video: "assets/reels/elite-brand-ad.mp4", poster: "assets/reels/elite-brand-ad.jpg" },
    { title: "Taxi App — Investor Pitch", client: "Taxi App", length: "1:01", video: "assets/reels/taxi-app-ad.mp4", poster: "assets/reels/taxi-app-ad.jpg" },
    { title: "ICET — Choose Your Profession", client: "ICET Institute", length: "2:02", video: "assets/reels/icet-career-promo.mp4", poster: "assets/reels/icet-career-promo.jpg" },
    { title: "PTE Solution — Course Promo", client: "PTE Solution", length: "1:22", video: "assets/reels/pte-course-promo.mp4", poster: "assets/reels/pte-course-promo.jpg" },
    { title: "PTE Solution — Student Ad", client: "PTE Solution", length: "1:42", video: "assets/reels/pte-student-ad.mp4", poster: "assets/reels/pte-student-ad.jpg" },
    { title: "PTE Tips — Repeat Sentences", client: "PTE Solution", length: "0:29", video: "assets/reels/pte-repeat-sentences.mp4", poster: "assets/reels/pte-repeat-sentences.jpg" },
  ],

  // Long-form YouTube videos (shown under the reels). Paste normal YouTube links; playlist links work too.
  youtube: [
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

  // Facebook pages I manage — shown with Facebook's live page preview
  pages: [
    { name: "Upali Pooja Bhanda", url: "https://www.facebook.com/profile.php?id=100063587616190" },
    { name: "Russel's Tea Services and Catering", url: "https://www.facebook.com/russelscatering" },
    { name: "Russels Dimbula Tea and Ceylon Spices", url: "https://www.facebook.com/russelsdimbulateaandceylonspices/" },
    { name: "Russel Francis Perera", url: "https://www.facebook.com/profile.php?id=61586921127253" },
    { name: "ELITE Home Care Nursing", url: "https://www.facebook.com/profile.php?id=61574318894374" },
  ],

  // "From wireframe to real" slider — sketch = the wireframe, real = screenshot of the live site.
  // Both images should be the same size. Add more items to get tabs.
  compare: [
    { name: "Elite Home Care Nursing", url: "https://elitehomecarenursing.lk/", sketch: "assets/wireframe-elite.jpg", real: "assets/real-elite.jpg" },
  ],

  clients: [
    "Gloma International", "MAS Bodyline", "Upali Pooja Bhanda", "La Villa Hotel", "Elite Home Care",
    "Russel's Catering", "Russels Dimbula Tea", "Focus Photography", "Nextera Team",
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

  // Photography gallery (add or change photos in the admin panel)
  photos: [
    { src: "assets/photos/wedding.jpg", caption: "Wedding film — Leshika & Chathura", category: "Weddings" },
    { src: "assets/photos/portrait-fan.jpg", caption: "Portrait & fashion shoot", category: "Portraits" },
    { src: "assets/photos/portrait-smile.jpg", caption: "Portrait & fashion shoot", category: "Portraits" },
    { src: "assets/photos/portrait-hands.jpg", caption: "Portrait & fashion shoot", category: "Portraits" },
  ],
  photoLink: "https://web.facebook.com/profile.php?id=61555425576942", // "See more" link (Focus Photography)

  journey: [
    {
      period: "Apr 2026 — Present",
      role: "Social Media Marketer & Developer",
      company: "Gloma International",
      text: "Plan and run social and paid campaigns that drive visibility, engagement and leads, and build the web solutions those campaigns land on.",
    },
    {
      period: "2025 — Present",
      role: "Graphic Design Intern — Branding & Communication",
      company: "MAS Bodyline (Pvt) Ltd, Agalawatta",
      text: "Support branding and communication design, create visual assets to brand guidelines, and handle photography and videography.",
    },
    {
      period: "2024 — Present",
      role: "Graphic Designer (Remote)",
      company: "Upali Pooja Bhanda (Pvt) Ltd, Horana",
      text: "Design digital creatives for social media and promotions, helping improve the online brand presence.",
    },
    {
      period: "2024 — 2025",
      role: "Graphic Designer & Content Creator",
      company: "La Villa Hotel, Ingiriya",
      text: "Designed promotional posters and marketing visuals, and created digital content for hotel branding and campaigns.",
    },
    {
      period: "2024 — 2025",
      role: "Computer Operator",
      company: "Upali Pooja Bhanda (Pvt) Ltd, Horana",
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
