/* ================================================================
   data.js — Asset + Blog Database
   ================================================================
   downloadUrl: A real URL the browser will actually download.
   All assets currently point to a small real sample ZIP file
   hosted on GitHub so the download button works immediately.

   HOW TO UPDATE LATER:
   When you have your own files hosted (e.g. on Cloudflare R2,
   AWS S3, or your own server), just replace each downloadUrl
   with the direct link to that asset's real ZIP file.
   e.g. downloadUrl: "https://your-cdn.com/assets/node-wrangler.zip"
================================================================ */

/* ================================================================
   RESOURCE TYPES — controls the entire user experience per asset
   ================================================================
   type: "free"     → Download button → triggers GitHub Release ZIP
   type: "premium"  → "Let's Talk" button → contact-premium.html
   type: "contact"  → "Request This" button → contact-premium.html

   contactSubject: pre-fills the subject line on the contact page
   so the visitor doesn't have to type what they're enquiring about.
   Only needed on premium/contact assets — free assets ignore it.
================================================================ */

const SAMPLE_ZIP = "https://github.com/skytechlord/nexus-assets/releases/download/v1.0.0/NexusAssets-Test.zip";

const ASSETS = [
  {
    id: 1,
    title: "Node Wrangler Pro — Extended Pack",
    category: "blender", categoryLabel: "Blender",
    description: "A curated extension of Blender's Node Wrangler addon with 30+ extra shortcuts for shader and geometry node workflows. Speeds up node editing significantly.",
    tags: ["addon","nodes","shader","workflow"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    emoji: "🎨", fileSize: "1.2 MB", fileFormat: "ZIP (.py addon)",
    version: "2.1.0", blenderVersion: "3.6+",
    downloads: 4820, featured: true, dateAdded: "2025-03-10",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 2,
    title: "Procedural Rock Generator",
    category: "blender", categoryLabel: "Blender",
    description: "A geometry nodes setup that generates infinite rock variations with a single click. Includes surface erosion, moss coverage, and size controls.",
    tags: ["geometry nodes","procedural","rock","environment"],
    image: "https://images.unsplash.com/photo-1567225557594-88d73e55f2cb?w=600&q=80",
    emoji: "🪨", fileSize: "3.4 MB", fileFormat: "ZIP (.blend file)",
    version: "1.0.0", blenderVersion: "4.0+",
    downloads: 2140, featured: true, dateAdded: "2025-04-01",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 3,
    title: "Cloth Simulation Presets Pack",
    category: "blender", categoryLabel: "Blender",
    description: "12 ready-to-use cloth simulation presets for Blender — silk, denim, heavy leather, and sheer fabric. Just append and apply.",
    tags: ["cloth","simulation","physics","presets"],
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
    emoji: "🧵", fileSize: "800 KB", fileFormat: "ZIP (.blend file)",
    version: "1.3.0", blenderVersion: "3.4+",
    downloads: 1560, featured: false, dateAdded: "2025-02-14",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 4,
    title: "Cinematic Dust & Particles Pack",
    category: "vfx", categoryLabel: "VFX",
    description: "50 high-quality dust, smoke, and particle overlay clips in 4K ProRes. Shot on black backgrounds for easy Screen blending.",
    tags: ["particles","dust","overlay","4K"],
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&q=80",
    emoji: "✨", fileSize: "480 MB", fileFormat: "ZIP (MOV files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 6300, featured: true, dateAdded: "2025-01-20",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 5,
    title: "Neon Light Leaks — 30 Pack",
    category: "vfx", categoryLabel: "VFX",
    description: "30 vivid neon-colored light leak overlays. Perfect for music videos, social media content, and stylized film grades.",
    tags: ["light leaks","neon","overlay","stylized"],
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&q=80",
    emoji: "💡", fileSize: "210 MB", fileFormat: "ZIP (MOV files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 3910, featured: false, dateAdded: "2025-03-05",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 6,
    title: "Glitch & Datamosh Transitions",
    category: "vfx", categoryLabel: "VFX",
    description: "20 glitch and datamosh transition clips for edgy digital-aesthetic cuts. Includes RGB splits, horizontal wipes, and pixel shifting.",
    tags: ["glitch","transition","digital","datamosh"],
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
    emoji: "📺", fileSize: "150 MB", fileFormat: "ZIP (MOV files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 5120, featured: true, dateAdded: "2025-04-15",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 7,
    title: "Sci-Fi Crate Collection",
    category: "models", categoryLabel: "3D Models",
    description: "10 modular sci-fi crates with full PBR materials. Ideal for game environments, Blender renders, or Unreal Engine scenes. LODs included.",
    tags: ["sci-fi","props","game-ready","PBR"],
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&q=80",
    emoji: "🧊", fileSize: "28 MB", fileFormat: "ZIP (FBX + OBJ + textures)",
    version: "1.0.0", blenderVersion: null,
    downloads: 3250, featured: true, dateAdded: "2025-02-28",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 8,
    title: "Stylized Tree Pack — 6 Variants",
    category: "models", categoryLabel: "3D Models",
    description: "6 stylized low-poly trees for game jams, indie games, or arch-viz. Includes autumn and summer color variants.",
    tags: ["nature","stylized","low-poly","game-ready"],
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    emoji: "🌲", fileSize: "12 MB", fileFormat: "ZIP (FBX + textures)",
    version: "1.1.0", blenderVersion: null,
    downloads: 4700, featured: false, dateAdded: "2025-01-08",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 9,
    title: "Urban Street Furniture Kit",
    category: "models", categoryLabel: "3D Models",
    description: "Benches, bins, lampposts, mailboxes, and bollards — 20 pieces of urban street furniture with realistic PBR textures at 2K.",
    tags: ["urban","props","environment","PBR"],
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    emoji: "🪑", fileSize: "45 MB", fileFormat: "ZIP (FBX + OBJ + textures)",
    version: "1.0.0", blenderVersion: null,
    downloads: 1980, featured: false, dateAdded: "2025-03-22",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 10,
    title: "Concrete Walls — 10 PBR Sets",
    category: "textures", categoryLabel: "Textures",
    description: "10 photorealistic concrete wall textures. Each set includes Albedo, Normal, Roughness, AO, and Height maps at 4K. Seamlessly tileable.",
    tags: ["concrete","PBR","seamless","4K"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    emoji: "🖼", fileSize: "320 MB", fileFormat: "ZIP (PNG files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 7400, featured: true, dateAdded: "2025-01-15",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 11,
    title: "Rusty Metal — 8 PBR Sets",
    category: "textures", categoryLabel: "Textures",
    description: "8 varieties of rusty metal surface textures with varying degrees of corrosion. Full PBR pipeline at 2K and 4K.",
    tags: ["metal","rust","PBR","industrial"],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
    emoji: "🔩", fileSize: "240 MB", fileFormat: "ZIP (PNG files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 5600, featured: false, dateAdded: "2025-02-02",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 12,
    title: "Studio HDRI Pack — 6 Setups",
    category: "textures", categoryLabel: "Textures",
    description: "6 professional studio HDRI lighting setups for clean product and character rendering. 8K resolution. Neutral, warm, cold, and dramatic variations.",
    tags: ["HDRI","lighting","studio","8K"],
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
    emoji: "💫", fileSize: "180 MB", fileFormat: "ZIP (EXR files)",
    version: "1.0.0", blenderVersion: null,
    downloads: 8100, featured: true, dateAdded: "2025-04-10",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 13,
    title: "Minimal Motion Titles — AE Template",
    category: "templates", categoryLabel: "Templates",
    description: "15 minimal animated title cards for After Effects. No plugins needed. Fully customizable colors and fonts.",
    tags: ["after effects","motion","titles","minimal"],
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
    emoji: "📐", fileSize: "22 MB", fileFormat: "ZIP (AEP file)",
    version: "1.0.0", blenderVersion: null,
    downloads: 3300, featured: true, dateAdded: "2025-03-18",
    type: "free",
    downloadUrl: SAMPLE_ZIP
  },
  {
    id: 14,
    title: "Social Media UI Kit — Figma",
    category: "templates", categoryLabel: "Templates",
    description: "Complete UI kit for social media content. 80+ components including story frames, post templates, icon sets, and color palettes.",
    tags: ["figma","UI kit","social media","design"],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&q=80",
    emoji: "📱", fileSize: "8 MB", fileFormat: "ZIP (.fig file)",
    version: "2.0.0", blenderVersion: null,
    downloads: 2850, featured: false, dateAdded: "2025-04-22",
    type: "premium",
    contactSubject: "Interested in Social Media UI Kit — Figma"
  },
  {
    id: 15,
    title: "Brutalist Portfolio — HTML Template",
    category: "templates", categoryLabel: "Templates",
    description: "A bold, editorial HTML/CSS portfolio template with a brutalist aesthetic. Fully responsive, dark mode, zero dependencies.",
    tags: ["HTML","CSS","portfolio","brutalist"],
    image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80",
    emoji: "💻", fileSize: "1.5 MB", fileFormat: "ZIP (HTML/CSS/JS)",
    version: "1.2.0", blenderVersion: null,
    downloads: 4100, featured: true, dateAdded: "2025-05-01",
    type: "premium",
    contactSubject: "Interested in Brutalist Portfolio — HTML Template"
  }
];

/* ── Asset helper functions ──────────────────────────────────── */
function getFeaturedAssets() { return ASSETS.filter(a => a.featured === true); }
function getAssetsByCategory(c) { if (c === 'all') return ASSETS; return ASSETS.filter(a => a.category === c); }
function getAssetById(id) { return ASSETS.find(a => a.id === id); }
function getRelatedAssets(category, excludeId, limit = 3) { return ASSETS.filter(a => a.category === category && a.id !== excludeId).slice(0, limit); }
function searchAssets(query, pool = ASSETS) { const q = query.toLowerCase().trim(); if (!q) return pool; return pool.filter(a => [a.title, a.categoryLabel, ...a.tags].join(' ').toLowerCase().includes(q)); }
function sortAssets(assets, method) { const c = [...assets]; if (method === 'downloads') return c.sort((a, b) => b.downloads - a.downloads); if (method === 'newest') return c.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)); if (method === 'az') return c.sort((a, b) => a.title.localeCompare(b.title)); return c; }
function formatDownloads(count) { if (count >= 1000) return (count / 1000).toFixed(1) + 'k'; return count.toString(); }

/* ── Blog data ───────────────────────────────────────────────── */
const BLOG_POSTS = [
  { id:1, slug:"10-blender-shortcuts", title:"10 Blender Shortcuts Every Beginner Should Know", category:"blender", categoryLabel:"Blender", excerpt:"Stop hunting through menus. These ten keyboard shortcuts will speed up your Blender workflow from day one.", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", author:"Zara Mills", authorInitials:"ZM", dateAdded:"2025-05-12", readTime:6, content:["If you're new to Blender, the sheer number of menus and panels can feel overwhelming. The good news is that almost everything you'll do day-to-day can be triggered with a keyboard shortcut — and learning just ten of them will dramatically speed up your workflow.","1. Tab — Toggle Edit Mode: This is the single most-used shortcut in Blender. Pressing Tab switches between Object Mode and Edit Mode instantly.","2. G, R, S — Grab, Rotate, Scale: These three letters control every transformation. Press G to move, R to rotate, S to scale. Combine with X, Y, or Z to constrain to one axis.","3. Ctrl+R — Loop Cut: Adds a ring of new edges around your mesh. Essential for adding detail.","4. Shift+A — Add Menu: Brings up the Add menu right where your cursor is instead of navigating the top bar.","5. Numpad 0 — Camera View: Jump instantly into your scene's camera view to check framing.","6. Ctrl+Z — Undo: Blender's undo history is deep — don't be afraid to experiment and roll back.","7. Alt+A — Deselect All: A fast way to clear your current selection before starting a new operation.","8. N — Properties Sidebar: Shows precise X/Y/Z values for your selected object.","9. Ctrl+J — Join Objects: Merge multiple selected objects into one single mesh.","10. F3 — Search Menu: Opens a searchable command palette — type what you want and Blender finds it instantly.","Memorizing these shortcuts won't happen overnight, but if you make a conscious effort to use them instead of clicking through menus, they'll become second nature within a couple of weeks."] },
  { id:2, slug:"understanding-pbr-textures", title:"Understanding PBR Textures: A Beginner's Guide", category:"textures", categoryLabel:"Textures", excerpt:"Albedo, Roughness, Normal, AO — what do these texture maps actually do? We break down PBR in plain language.", image:"https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80", author:"Remi Osei", authorInitials:"RO", dateAdded:"2025-04-28", readTime:8, content:["If you've downloaded a texture pack recently, you've probably noticed it comes with several image files instead of just one. This is called PBR — Physically Based Rendering — and understanding each file will make a huge difference in how realistic your renders look.","Albedo Map: The base color of your surface, without any lighting or shadow baked in. Think of it as the raw paint color photographed in perfectly flat, even light.","Roughness Map: This grayscale image controls how light scatters off the surface. White = rough and matte. Black = smooth and glossy.","Normal Map: The often purple-blue image encodes tiny surface bumps and details without needing actual geometry. It tricks the renderer into seeing detail that isn't really there.","Height Map: Unlike a normal map which fakes detail using lighting tricks, a height map can push and pull actual geometry for real physical bumps.","Ambient Occlusion Map: Shows how exposed each part of the surface is to ambient light. Crevices are darker, open surfaces lighter. Adds subtle depth and realism.","Metallic Map: A simple black-and-white mask. White = metal, black = non-metal like plastic, wood, or fabric.","When you combine all these maps in your shader nodes, you get materials that respond to light the way real-world surfaces do under any lighting condition."] },
  { id:3, slug:"how-to-choose-the-right-license", title:"How to Choose the Right License for Your Assets", category:"templates", categoryLabel:"Resources", excerpt:"CC0? CC-BY? Choosing a license for your creative work is more important than most beginners realize.", image:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80", author:"Kofi Asante", authorInitials:"KA", dateAdded:"2025-04-15", readTime:5, content:["Every time you publish a digital asset, you're making a legal decision whether you realize it or not. By default, copyright law gives you full rights over anything you create the moment you create it.","This is where licenses come in. A license is a clear statement of exactly what permissions you're granting to other people. Without one, potential users don't know if they can use your asset commercially or at all.","CC0 (Public Domain): The most permissive license. Anyone can use it for any purpose — personal, commercial, modified or not — without asking permission or giving credit.","CC-BY (Attribution): Same broad usage as CC0 but requires users to credit you as the original creator. Good if you want recognition for your work.","CC-BY-SA (ShareAlike): Requires that anyone who modifies and redistributes your work must release their version under the same license.","CC-BY-NC (Non-Commercial): Restricts usage to non-commercial projects only. Common for creators who don't want companies profiting without compensation.","All Rights Reserved: The default if you don't choose a license. Nobody can legally use your work without directly asking you for permission.","Ask yourself: do I want maximum spread even without credit? Choose CC0. Want credit but broad usage? Choose CC-BY. Worried about commercial exploitation? Consider CC-BY-NC."] },
  { id:4, slug:"optimizing-3d-models-for-game-engines", title:"Optimizing 3D Models for Game Engines", category:"models", categoryLabel:"3D Models", excerpt:"A beautiful render means nothing if your game runs at 5 FPS. Learn the key optimization techniques every game-ready model needs.", image:"https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80", author:"Yuki Park", authorInitials:"YP", dateAdded:"2025-03-30", readTime:7, content:["There's a big difference between a model built for a cinematic render and one built to run smoothly in a real-time game engine. Game engines redraw the scene up to 120 times per second, so every unnecessary triangle adds up fast.","Polygon Count Matters: Aim for the lowest polygon count that still looks correct at the distance the object will typically be viewed from.","Use Level of Detail (LOD): Most game engines support swapping between multiple versions of the same model based on camera distance. A tree with 10,000 polygons up close might swap to 200 polygons from far away.","Bake Detail Into Normal Maps: Sculpt detail on a high-resolution model then bake it into a normal map applied to a simpler low-poly version.","Combine Materials and Textures: Every separate material usually means an extra draw call. Combining textures into a single atlas can significantly reduce draw calls per object.","Watch Your Texture Resolution: A 4K texture is wasted on an object that takes up a small part of the screen. Match resolution to expected on-screen size.","Clean Topology Still Matters: Messy overlapping geometry causes rendering glitches even with all optimizations in place. Keep the mesh structure clean.","The best game artists think about performance from the very first vertex they place, not as an afterthought."] },
  { id:5, slug:"5-free-vfx-techniques", title:"5 Free VFX Techniques That Look Expensive", category:"vfx", categoryLabel:"VFX", excerpt:"You don't need a Hollywood budget to make your videos look cinematic. These five free techniques punch well above their weight.", image:"https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&q=80", author:"Remi Osei", authorInitials:"RO", dateAdded:"2025-03-05", readTime:6, content:["Big-budget visual effects often come down to a handful of fundamental techniques applied with care, not expensive software. Here are five that consistently punch above their actual cost.","1. Light Leaks and Lens Flares: A subtle warm light leak across your frame instantly adds a cinematic quality. Free overlay packs layered in Screen blend mode can transform a flat shot completely.","2. Practical Dust and Atmosphere: Adding floating dust particles or thin fog creates a sense of depth that's hard to achieve otherwise. Even free stock overlays sell the illusion of physical space.","3. Chromatic Aberration: The slight color fringing seen in real camera lenses. Adding just a pixel or two of red/blue separation at frame edges makes digital footage feel less artificial.","4. Speed Ramping: Smoothly transitioning between slow motion and normal speed within a single shot creates dramatic emphasis using only timing.","5. Color Grading with LUTs: A Look-Up Table shifts your footage colors to match a mood. Many free LUT packs exist and applying one consistently gives footage a unified professional look.","None of these techniques require expensive plugins. What they require is restraint — the best VFX is often invisible, supporting the story rather than calling attention to itself."] },
  { id:6, slug:"building-a-design-system", title:"Building a Consistent Design System From Scratch", category:"templates", categoryLabel:"Design", excerpt:"Why does NexusAssets look the same across every page? It's not magic — it's a design system. Here's how we built ours.", image:"https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80", author:"Yuki Park", authorInitials:"YP", dateAdded:"2025-02-18", readTime:5, content:["If you've browsed through several pages on this site, you've probably noticed something: every button looks the same, every card has the same rounded corners, every heading uses the same font. That consistency comes from a design system.","What Is a Design System? A set of reusable rules and components defining how a product looks and behaves. Instead of deciding button color individually every time, you decide it once and reuse it everywhere.","Start With CSS Variables: The foundation lives in CSS custom properties — things like --color-accent and --space-lg. When every value references a variable instead of a hardcoded number, changing the entire site's look becomes a one-line edit.","Define Your Type Scale Early: Headings and body text should have a small, predictable set of sizes. We use clamp() which lets font sizes scale smoothly between a minimum and maximum based on screen width.","Build Components, Not Pages: Instead of styling the homepage hero and the about page hero as two separate things, we built a single .page-hero component used across multiple pages.","Document As You Go: Every CSS file includes comments explaining what each section does and why decisions were made. This helps future you understand the codebase.","A good design system doesn't happen by writing a big rulebook upfront. It happens gradually by noticing repetition and extracting it into something reusable."] }
];

/* ── Blog helper functions ───────────────────────────────────── */
function getBlogPostsByCategory(c) { if (c === 'all') return BLOG_POSTS; return BLOG_POSTS.filter(p => p.category === c); }
function getBlogPostById(id) { return BLOG_POSTS.find(p => p.id === id); }
function getRelatedPosts(excludeId, category, limit = 3) { const same = BLOG_POSTS.filter(p => p.id !== excludeId && p.category === category); if (same.length >= limit) return same.slice(0, limit); const others = BLOG_POSTS.filter(p => p.id !== excludeId && p.category !== category); return [...same, ...others].slice(0, limit); }
function formatBlogDate(dateStr) { const d = new Date(dateStr); return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
