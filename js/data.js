/* ================================================================
   js/data.js — Blog Data
   ================================================================
   WHAT CHANGED:
   The ASSETS array and all asset helper functions (getFeaturedAssets,
   getAssetsByCategory, getAssetById, getRelatedAssets, searchAssets,
   sortAssets, formatDownloads) have been removed.

   Resources are now served from Supabase public.resources via
   supabasePublicFetch() in supabase-client.js. The public RLS policy
   allows anonymous reads of published resources.

   This file now contains only:
   - BLOG_POSTS array
   - Blog helper functions
   - formatDownloads() — still used by main.js for display formatting
================================================================ */

/* ================================================================
   FORMAT HELPERS
================================================================ */
function formatDownloads(count) {
  if (!count && count !== 0) return '0';
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
  return count.toString();
}

/* ================================================================
   BLOG DATA
================================================================ */
const BLOG_POSTS = [
  {
    id: 1,
    slug: "10-blender-shortcuts",
    title: "10 Blender Shortcuts Every Beginner Should Know",
    category: "blender",
    categoryLabel: "Blender",
    excerpt: "Stop hunting through menus. These ten keyboard shortcuts will speed up your Blender workflow from day one.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    author: "Zara Mills",
    authorInitials: "ZM",
    dateAdded: "2025-05-12",
    readTime: 6,
    content: [
      "If you're new to Blender, the sheer number of menus and panels can feel overwhelming. The good news is that almost everything you'll do day-to-day can be triggered with a keyboard shortcut — and learning just ten of them will dramatically speed up your workflow.",
      "1. Tab — Toggle Edit Mode: This is the single most-used shortcut in Blender. Pressing Tab switches between Object Mode and Edit Mode instantly.",
      "2. G, R, S — Grab, Rotate, Scale: These three letters control every transformation. Press G to move, R to rotate, S to scale. Combine with X, Y, or Z to constrain to one axis.",
      "3. Ctrl+R — Loop Cut: Adds a ring of new edges around your mesh. Essential for adding detail to your models.",
      "4. Shift+A — Add Menu: Brings up the Add menu right where your cursor is instead of navigating the top bar.",
      "5. Numpad 0 — Camera View: Jump instantly into your scene's camera view to check framing.",
      "6. Ctrl+Z — Undo: Blender's undo history is deep — don't be afraid to experiment and roll back.",
      "7. Alt+A — Deselect All: A fast way to clear your current selection before starting a new operation.",
      "8. N — Properties Sidebar: Shows precise X/Y/Z values for your selected object.",
      "9. Ctrl+J — Join Objects: Merge multiple selected objects into one single mesh.",
      "10. F3 — Search Menu: Opens a searchable command palette — type what you want and Blender finds it instantly.",
      "Memorizing these shortcuts won't happen overnight, but if you make a conscious effort to use them instead of clicking through menus, they'll become second nature within a couple of weeks."
    ]
  },
  {
    id: 2,
    slug: "understanding-pbr-textures",
    title: "Understanding PBR Textures: A Beginner's Guide",
    category: "textures",
    categoryLabel: "Textures",
    excerpt: "Albedo, Roughness, Normal, AO — what do these texture maps actually do? We break down PBR in plain language.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
    author: "Remi Osei",
    authorInitials: "RO",
    dateAdded: "2025-04-28",
    readTime: 8,
    content: [
      "If you've downloaded a texture pack recently, you've probably noticed it comes with several image files instead of just one. This is called PBR — Physically Based Rendering — and understanding each file will make a huge difference in how realistic your renders look.",
      "Albedo Map: The base color of your surface, without any lighting or shadow baked in. Think of it as the raw paint color photographed in perfectly flat, even light.",
      "Roughness Map: This grayscale image controls how light scatters off the surface. White = rough and matte. Black = smooth and glossy.",
      "Normal Map: The often purple-blue image encodes tiny surface bumps and details without needing actual geometry. It tricks the renderer into seeing detail that isn't really there.",
      "Height Map: Unlike a normal map which fakes detail using lighting tricks, a height map can push and pull actual geometry for real physical bumps.",
      "Ambient Occlusion Map: Shows how exposed each part of the surface is to ambient light. Crevices are darker, open surfaces lighter. Adds subtle depth and realism.",
      "Metallic Map: A simple black-and-white mask. White = metal, black = non-metal like plastic, wood, or fabric.",
      "When you combine all these maps in your shader nodes, you get materials that respond to light the way real-world surfaces do under any lighting condition."
    ]
  },
  {
    id: 3,
    slug: "how-to-choose-the-right-license",
    title: "How to Choose the Right License for Your Assets",
    category: "templates",
    categoryLabel: "Resources",
    excerpt: "CC0? CC-BY? Choosing a license for your creative work is more important than most beginners realize.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    author: "Kofi Asante",
    authorInitials: "KA",
    dateAdded: "2025-04-15",
    readTime: 5,
    content: [
      "Every time you publish a digital asset, you're making a legal decision whether you realize it or not. By default, copyright law gives you full rights over anything you create the moment you create it.",
      "This is where licenses come in. A license is a clear statement of exactly what permissions you're granting to other people. Without one, potential users don't know if they can use your asset commercially or at all.",
      "CC0 (Public Domain): The most permissive license. Anyone can use it for any purpose — personal, commercial, modified or not — without asking permission or giving credit.",
      "CC-BY (Attribution): Same broad usage as CC0 but requires users to credit you as the original creator. Good if you want recognition for your work.",
      "CC-BY-SA (ShareAlike): Requires that anyone who modifies and redistributes your work must release their version under the same license.",
      "CC-BY-NC (Non-Commercial): Restricts usage to non-commercial projects only.",
      "All Rights Reserved: The default if you don't choose a license. Nobody can legally use your work without directly asking you for permission.",
      "Ask yourself: do I want maximum spread even without credit? Choose CC0. Want credit but broad usage? Choose CC-BY."
    ]
  },
  {
    id: 4,
    slug: "optimizing-3d-models-for-game-engines",
    title: "Optimizing 3D Models for Game Engines",
    category: "models",
    categoryLabel: "3D Models",
    excerpt: "A beautiful render means nothing if your game runs at 5 FPS. Learn the key optimization techniques every game-ready model needs.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80",
    author: "Yuki Park",
    authorInitials: "YP",
    dateAdded: "2025-03-30",
    readTime: 7,
    content: [
      "There's a big difference between a model built for a cinematic render and one built to run smoothly in a real-time game engine. Game engines redraw the scene up to 120 times per second, so every unnecessary triangle adds up fast.",
      "Polygon Count Matters: Aim for the lowest polygon count that still looks correct at the distance the object will typically be viewed from.",
      "Use Level of Detail (LOD): Most game engines support swapping between multiple versions of the same model based on camera distance.",
      "Bake Detail Into Normal Maps: Sculpt detail on a high-resolution model then bake it into a normal map applied to a simpler low-poly version.",
      "Combine Materials and Textures: Every separate material usually means an extra draw call. Combining textures into a single atlas can significantly reduce draw calls per object.",
      "Watch Your Texture Resolution: A 4K texture is wasted on an object that takes up a small part of the screen.",
      "Clean Topology Still Matters: Messy overlapping geometry causes rendering glitches even with all optimizations in place.",
      "The best game artists think about performance from the very first vertex they place, not as an afterthought."
    ]
  },
  {
    id: 5,
    slug: "5-free-vfx-techniques",
    title: "5 Free VFX Techniques That Look Expensive",
    category: "vfx",
    categoryLabel: "VFX",
    excerpt: "You don't need a Hollywood budget to make your videos look cinematic. These five free techniques punch well above their weight.",
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=800&q=80",
    author: "Remi Osei",
    authorInitials: "RO",
    dateAdded: "2025-03-05",
    readTime: 6,
    content: [
      "Big-budget visual effects often come down to a handful of fundamental techniques applied with care, not expensive software.",
      "1. Light Leaks and Lens Flares: A subtle warm light leak across your frame instantly adds a cinematic quality.",
      "2. Practical Dust and Atmosphere: Adding floating dust particles or thin fog creates a sense of depth that's hard to achieve otherwise.",
      "3. Chromatic Aberration: Adding just a pixel or two of red/blue separation at frame edges makes digital footage feel less artificial.",
      "4. Speed Ramping: Smoothly transitioning between slow motion and normal speed creates dramatic emphasis using only timing.",
      "5. Color Grading with LUTs: A Look-Up Table shifts your footage colors to match a mood. Many free LUT packs exist.",
      "None of these techniques require expensive plugins. What they require is restraint — the best VFX is often invisible, supporting the story rather than calling attention to itself."
    ]
  },
  {
    id: 6,
    slug: "building-a-design-system",
    title: "Building a Consistent Design System From Scratch",
    category: "templates",
    categoryLabel: "Design",
    excerpt: "Why does NexusAssets look the same across every page? It's not magic — it's a design system. Here's how we built ours.",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    author: "Yuki Park",
    authorInitials: "YP",
    dateAdded: "2025-02-18",
    readTime: 5,
    content: [
      "If you've browsed through several pages on this site, you've probably noticed something: every button looks the same, every card has the same rounded corners, every heading uses the same font. That consistency comes from a design system.",
      "What Is a Design System? A set of reusable rules and components defining how a product looks and behaves.",
      "Start With CSS Variables: The foundation lives in CSS custom properties — things like --color-accent and --space-lg.",
      "Define Your Type Scale Early: Headings and body text should have a small, predictable set of sizes.",
      "Build Components, Not Pages: Instead of styling the homepage hero and the about page hero as two separate things, build a single .page-hero component used across multiple pages.",
      "Document As You Go: Every CSS file includes comments explaining what each section does and why decisions were made.",
      "A good design system doesn't happen by writing a big rulebook upfront. It happens gradually by noticing repetition and extracting it into something reusable."
    ]
  }
];

/* ================================================================
   BLOG HELPER FUNCTIONS
================================================================ */
function getBlogPostsByCategory(c) {
  if (c === 'all') return BLOG_POSTS;
  return BLOG_POSTS.filter(p => p.category === c);
}

function getBlogPostById(id) {
  return BLOG_POSTS.find(p => p.id === id);
}

function getRelatedPosts(excludeId, category, limit = 3) {
  const same   = BLOG_POSTS.filter(p => p.id !== excludeId && p.category === category);
  if (same.length >= limit) return same.slice(0, limit);
  const others = BLOG_POSTS.filter(p => p.id !== excludeId && p.category !== category);
  return [...same, ...others].slice(0, limit);
}

function formatBlogDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
