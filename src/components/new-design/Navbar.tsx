// "use client";

// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// import type { NavUser } from "@/components/HomePageClient-6";

// const GDRIVE_LINK = "https://drive.google.com/your-zip-link-here";

// const NAV_LINKS = [
//   { label: "Features",     href: "#features",     section: "features"    },
//   { label: "How it works", href: "#how-it-works",  section: "how-it-works" },
// ];

// // ─── Avatar ───────────────────────────────────────────────────────────────────
// function Avatar({ user, size = 28 }: { user: NavUser; size?: number }) {
//   const [imgError, setImgError] = useState(false);
//   const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

//   return (
//     <div style={{
//       width: size, height: size, borderRadius: "50%", flexShrink: 0,
//       background: "var(--accent-muted)",
//       border: "1.5px solid color-mix(in srgb, var(--accent) 45%, transparent)",
//       display: "flex", alignItems: "center", justifyContent: "center",
//       overflow: "hidden",
//     }}>
//       {user.avatar_url && !imgError ? (
//         // eslint-disable-next-line @next/next/no-img-element
//         <img src={user.avatar_url} alt={user.name}
//           onError={() => setImgError(true)}
//           style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//       ) : (
//         <span style={{
//           fontFamily: "var(--font-mono)", fontSize: size * 0.36,
//           fontWeight: 700, color: "var(--accent)", lineHeight: 1,
//         }}>{initials}</span>
//       )}
//     </div>
//   );
// }

// // ─── Profile dropdown ─────────────────────────────────────────────────────────
// function ProfileDropdown({ user, onClose }: { user: NavUser; onClose: () => void }) {
//   const reduce = useReducedMotion();
//   const menuItems = [
//     { label: "Dashboard",      href: "/dashboard",            icon: "⊞" },
//     { label: "My Problems",    href: "/dashboard/problems",   icon: "≡" },
//     { label: "Revision Queue", href: "/dashboard/revision",   icon: "◷" },
//     { label: "Analytics",      href: "/dashboard/analytics",  icon: "↗" },
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: reduce ? 0 : -8, scale: 0.96 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       exit={{ opacity: 0, y: reduce ? 0 : -6, scale: 0.96 }}
//       transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
//       style={{
//         position: "absolute", top: "calc(100% + 12px)", right: 0,
//         width: 232,
//         background: "var(--bg-surface)",
//         border: "1px solid var(--border-mid)",
//         borderRadius: 16,
//         boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px var(--border-subtle)",
//         overflow: "hidden", zIndex: 200,
//       }}
//     >
//       {/* Teal top line */}
//       <div style={{
//         height: 2,
//         background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
//       }} />

//       {/* User header */}
//       <div style={{
//         padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)",
//         display: "flex", alignItems: "center", gap: 10,
//       }}>
//         <Avatar user={user} size={34} />
//         <div style={{ minWidth: 0 }}>
//           <div style={{
//             fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
//             color: "var(--text-primary)",
//             overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//           }}>{user.name}</div>
//           <div style={{
//             fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1,
//             overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//           }}>{user.email}</div>
//         </div>
//       </div>

//       {/* Score row if available */}
//       {user.readiness_score !== undefined && (
//         <div style={{
//           padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)",
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//         }}>
//           <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
//             Readiness score
//           </span>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 5,
//             padding: "3px 10px",
//             background: "var(--accent-muted)",
//             border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
//             borderRadius: 100,
//           }}>
//             <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
//               {user.readiness_score}
//             </span>
//             <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>/100</span>
//           </div>
//         </div>
//       )}

//       {/* Nav items */}
//       <div style={{ padding: "6px" }}>
//         {menuItems.map((item) => (
//           <Link key={item.href} href={item.href} onClick={onClose}
//             style={{
//               display: "flex", alignItems: "center", gap: 9,
//               padding: "8px 10px", borderRadius: 10,
//               fontFamily: "var(--font-sans)", fontSize: 13,
//               color: "var(--text-secondary)", textDecoration: "none",
//               transition: "all var(--transition-fast)",
//             }}
//             onMouseEnter={(e) => {
//               const el = e.currentTarget as HTMLElement;
//               el.style.background = "var(--bg-hover)";
//               el.style.color = "var(--text-primary)";
//             }}
//             onMouseLeave={(e) => {
//               const el = e.currentTarget as HTMLElement;
//               el.style.background = "transparent";
//               el.style.color = "var(--text-secondary)";
//             }}
//           >
//             <span style={{
//               width: 22, height: 22, borderRadius: 6,
//               background: "var(--bg-elevated)",
//               border: "1px solid var(--border-subtle)",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: 11, color: "var(--text-muted)", flexShrink: 0,
//             }}>{item.icon}</span>
//             {item.label}
//           </Link>
//         ))}
//       </div>

//       {/* Sign out */}
//       <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "6px" }}>
//         <Link href="/auth/signout" onClick={onClose}
//           style={{
//             display: "flex", alignItems: "center", gap: 9,
//             padding: "8px 10px", borderRadius: 10,
//             fontFamily: "var(--font-sans)", fontSize: 13,
//             color: "var(--text-muted)", textDecoration: "none",
//             transition: "all var(--transition-fast)",
//           }}
//           onMouseEnter={(e) => {
//             const el = e.currentTarget as HTMLElement;
//             el.style.background = "color-mix(in srgb, var(--hard) 8%, transparent)";
//             el.style.color = "var(--hard)";
//           }}
//           onMouseLeave={(e) => {
//             const el = e.currentTarget as HTMLElement;
//             el.style.background = "transparent";
//             el.style.color = "var(--text-muted)";
//           }}
//         >
//           <span style={{
//             width: 22, height: 22, borderRadius: 6,
//             background: "var(--bg-elevated)",
//             border: "1px solid var(--border-subtle)",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             fontSize: 11, flexShrink: 0,
//           }}>→</span>
//           Sign out
//         </Link>
//       </div>
//     </motion.div>
//   );
// }

// // ─── Main Navbar ──────────────────────────────────────────────────────────────
// interface NavbarProps { user?: NavUser | null; }

// export default function Navbar({ user }: NavbarProps) {
//   const [scrolled,    setScrolled]    = useState(false);
//   const [hoveredLink, setHoveredLink] = useState<string | null>(null);
//   const [activeSection, setActiveSection] = useState<string | null>(null);
//   const [mobileOpen,  setMobileOpen]  = useState(false);
//   const [dropOpen,    setDropOpen]    = useState(false);
//   const [mounted,     setMounted]     = useState(false);
//   const dropRef = useRef<HTMLDivElement>(null);
//   const reduce  = useReducedMotion();

//   // Mount flag for entrance animations
//   useEffect(() => { setMounted(true); }, []);

//   // Scroll → island morph
//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 60);
//     window.addEventListener("scroll", onScroll, { passive: true });
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   // Section tracking via IntersectionObserver
//   useEffect(() => {
//     const observers: IntersectionObserver[] = [];
//     NAV_LINKS.forEach(({ section }) => {
//       const el = document.getElementById(section);
//       if (!el) return;
//       const obs = new IntersectionObserver(
//         ([entry]) => { if (entry.isIntersecting) setActiveSection(section); },
//         { threshold: 0.4 }
//       );
//       obs.observe(el);
//       observers.push(obs);
//     });
//     return () => observers.forEach((o) => o.disconnect());
//   }, []);

//   // Outside click closes dropdown
//   useEffect(() => {
//     if (!dropOpen) return;
//     const onDown = (e: MouseEvent) => {
//       if (dropRef.current && !dropRef.current.contains(e.target as Node))
//         setDropOpen(false);
//     };
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, [dropOpen]);

//   // ── Shared transition timing ──
//   const ISLAND_TRANSITION = reduce ? "none"
//     : "width 0.35s cubic-bezier(0.22,1,0.36,1), max-width 0.35s cubic-bezier(0.22,1,0.36,1), border-radius 0.35s cubic-bezier(0.22,1,0.36,1), padding 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, top 0.35s cubic-bezier(0.22,1,0.36,1)";

//   return (
//     <>
//       <style>{`
//         /* ── Mobile visibility ── */
//         .nav-desktop    { display: none !important; }
//         .nav-ctas       { display: none !important; }
//         .nav-mobile-btn { display: flex !important; }

//         @media (min-width: 768px) {
//           .nav-desktop    { display: flex !important; }
//           .nav-ctas       { display: flex !important; }
//           .nav-mobile-btn { display: none !important; }
//         }

//         /* ── Nav link base ── */
//         .nav-link-text {
//           font-family: var(--font-sans);
//           font-size: 13px; font-weight: 500;
//           color: var(--text-secondary);
//           text-decoration: none;
//           position: relative; z-index: 1;
//           transition: color 0.15s ease;
//           white-space: nowrap;
//         }

//         /* ── Mobile item ── */
//         .nav-mobile-item {
//           display: block; padding: 10px 12px;
//           border-radius: 10px;
//           font-family: var(--font-sans); font-size: 14px; font-weight: 500;
//           color: var(--text-secondary); text-decoration: none;
//           transition: all 0.15s ease;
//         }
//         .nav-mobile-item:hover {
//           color: var(--text-primary); background: var(--bg-hover);
//         }

//         /* ── Avatar button ── */
//         .nav-avatar-btn {
//           display: flex; align-items: center; gap: 6px;
//           background: transparent; border: none; cursor: pointer;
//           padding: 4px 8px 4px 4px; border-radius: 100px;
//           transition: background 0.15s ease;
//         }
//         .nav-avatar-btn:hover { background: var(--bg-hover); }

//         .nav-chevron {
//           color: var(--text-muted);
//           transition: transform 0.2s ease;
//         }
//         .nav-chevron.open { transform: rotate(180deg); }

//         /* ── Score chip ── */
//         .nav-score-chip {
//           display: flex; align-items: center; gap: 4px;
//           padding: 4px 10px 4px 8px;
//           background: var(--accent-muted);
//           border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
//           border-radius: 100px;
//           cursor: default;
//           transition: all 0.15s ease;
//         }
//         .nav-score-chip:hover {
//           border-color: color-mix(in srgb, var(--accent) 40%, transparent);
//           background: color-mix(in srgb, var(--accent) 10%, transparent);
//         }
//       `}</style>

//       {/* ── Outer wrapper — always fixed, full-width ── */}
//       <div style={{
//         position: "fixed",
//         top: 0, left: 0, right: 0,
//         zIndex: 100,
//         display: "flex",
//         justifyContent: "center",
//         /* Top padding creates the float gap when scrolled */
//         padding: scrolled ? "10px 20px 0" : "0",
//         transition: reduce ? "none" : "padding 0.35s cubic-bezier(0.22,1,0.36,1)",
//         pointerEvents: "none", /* let clicks through the outer gap */
//       }}>

//         {/* ── The island ── */}
//         <header style={{
//           width: "100%",
//           maxWidth: scrolled ? 860 : "100%",
//           height: scrolled ? 52 : 60,
//           borderRadius: scrolled ? 40 : 0,

//           /* Background */
//           background: scrolled
//             ? "color-mix(in srgb, var(--bg-surface) 82%, transparent)"
//             : "transparent",
//           backdropFilter: scrolled ? "blur(20px)" : "none",
//           WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",

//           /* Border */
//           border: scrolled
//             ? "1px solid color-mix(in srgb, var(--accent) 18%, var(--border-mid))"
//             : "1px solid transparent",

//           /* Shadow */
//           boxShadow: scrolled
//             ? "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px var(--border-subtle) inset"
//             : "none",

//           /* Layout */
//           display: "flex",
//           alignItems: "center",
//           paddingLeft:  scrolled ? "clamp(16px, 3vw, 28px)" : "clamp(16px, 4vw, 40px)",
//           paddingRight: scrolled ? "clamp(16px, 3vw, 28px)" : "clamp(16px, 4vw, 40px)",
//           position: "relative",

//           transition: ISLAND_TRANSITION,
//           pointerEvents: "all", /* re-enable on the bar itself */
//         }}>

//           {/* ── Logo ── */}
//           <motion.div
//             initial={reduce ? false : { opacity: 0, y: -6 }}
//             animate={mounted ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
//           >
//             <Link href="/" aria-label="Memoize home"
//               style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
//               <div style={{
//                 width: scrolled ? 28 : 32,
//                 height: scrolled ? 28 : 32,
//                 borderRadius: scrolled ? 8 : "var(--radius-md)",
//                 background: "var(--accent-muted)",
//                 border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
//                 display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
//                 transition: reduce ? "none" : "width 0.35s ease, height 0.35s ease, border-radius 0.35s ease",
//               }}>
//                 <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
//                   <path d="M3 5L1 8L3 11"   stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M10 3L6 13"       stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
//                 </svg>
//               </div>
//               <span style={{
//                 fontFamily: "var(--font-sans)", fontWeight: 600,
//                 fontSize: scrolled ? 15 : 16,
//                 letterSpacing: "-0.02em", color: "var(--text-primary)",
//                 transition: reduce ? "none" : "font-size 0.35s ease",
//               }}>Memoize</span>
//             </Link>
//           </motion.div>

//           {/* ── Desktop nav — absolutely centered ── */}
//           <nav
//             className="nav-desktop"
//             style={{
//               position: "absolute",
//               left: "50%", transform: "translateX(-50%)",
//               display: "flex", alignItems: "center",
//               gap: 2,
//             }}
//             aria-label="Primary navigation"
//           >
//             {NAV_LINKS.map(({ label, href, section }, i) => {
//               const isActive  = activeSection === section;
//               const isHovered = hoveredLink === href;

//               return (
//                 <motion.a
//                   key={href}
//                   href={href}
//                   className="nav-link-text"
//                   initial={reduce ? false : { opacity: 0, y: -5 }}
//                   animate={mounted ? { opacity: 1, y: 0 } : {}}
//                   transition={{ duration: 0.35, delay: 0.08 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
//                   onMouseEnter={() => setHoveredLink(href)}
//                   onMouseLeave={() => setHoveredLink(null)}
//                   style={{
//                     padding: "6px 13px",
//                     borderRadius: 100,
//                     position: "relative",
//                     display: "flex", alignItems: "center", gap: 5,
//                     color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
//                     fontWeight: isActive ? 600 : 500,
//                   }}
//                 >
//                   {/* Sliding background pill */}
//                   {isHovered && (
//                     <motion.span
//                       layoutId="nav-hover-pill"
//                       style={{
//                         position: "absolute", inset: 0,
//                         borderRadius: 100,
//                         background: "var(--bg-elevated)",
//                         border: "1px solid var(--border-subtle)",
//                       }}
//                       transition={{ type: "spring", stiffness: 500, damping: 35 }}
//                     />
//                   )}

//                   {/* Active section dot */}
//                   {isActive && (
//                     <motion.span
//                       layoutId="nav-active-dot"
//                       style={{
//                         width: 4, height: 4, borderRadius: "50%",
//                         background: "var(--accent)",
//                         boxShadow: "0 0 6px var(--accent)",
//                         flexShrink: 0, position: "relative", zIndex: 1,
//                       }}
//                       transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                     />
//                   )}

//                   <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
//                 </motion.a>
//               );
//             })}
//           </nav>

//           <div style={{ flex: 1 }} />

//           {/* ── Desktop right side ── */}
//           <motion.div
//             className="nav-ctas"
//             style={{ alignItems: "center", gap: 8 }}
//             initial={reduce ? false : { opacity: 0, y: -5 }}
//             animate={mounted ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//           >
//             {user ? (
//               <>
//                 {/* Score chip */}
//                 {user.readiness_score !== undefined && (
//                   <motion.div
//                     className="nav-score-chip"
//                     title={`Readiness score: ${user.readiness_score}/100`}
//                     initial={{ opacity: 0, scale: 0.85 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ duration: 0.3, delay: 0.25, ease: "backOut" }}
//                   >
//                     {/* Pulsing dot */}
//                     <motion.span
//                       animate={reduce ? {} : { scale: [1, 1.4, 1], opacity: [0.9, 0.4, 0.9] }}
//                       transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
//                       style={{
//                         width: 5, height: 5, borderRadius: "50%",
//                         background: "var(--accent)",
//                         display: "inline-block", flexShrink: 0,
//                       }}
//                     />
//                     <span style={{
//                       fontFamily: "var(--font-mono)", fontSize: 12,
//                       fontWeight: 700, color: "var(--accent)",
//                     }}>{user.readiness_score}</span>
//                     <span style={{
//                       fontFamily: "var(--font-mono)", fontSize: 9,
//                       color: "var(--text-muted)",
//                     }}>/100</span>
//                   </motion.div>
//                 )}

//                 {/* Avatar + dropdown */}
//                 <div ref={dropRef} style={{ position: "relative" }}>
//                   <button
//                     className="nav-avatar-btn"
//                     onClick={() => setDropOpen((v) => !v)}
//                     aria-label="Profile menu" aria-expanded={dropOpen}
//                   >
//                     <Avatar user={user} size={28} />
//                     <span style={{
//                       fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
//                       color: "var(--text-primary)", maxWidth: 100,
//                       overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                     }}>{user.name.split(" ")[0]}</span>
//                     <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
//                       className={`nav-chevron${dropOpen ? " open" : ""}`}>
//                       <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4"
//                         strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                   </button>

//                   <AnimatePresence>
//                     {dropOpen && (
//                       <ProfileDropdown user={user} onClose={() => setDropOpen(false)} />
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <Link href="/login" className="btn btn-ghost"
//                   style={{ fontSize: 13, padding: "6px 14px" }}>
//                   Sign in
//                 </Link>
//                 <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
//                   className="btn btn-primary"
//                   style={{ fontSize: 13, padding: scrolled ? "5px 14px" : "6px 16px", gap: 7,
//                     transition: "padding 0.35s ease" }}>
//                   <ChromeIcon />
//                   Add to Chrome
//                 </a>
//               </>
//             )}
//           </motion.div>

//           {/* ── Mobile hamburger ── */}
//           <button
//             className="nav-mobile-btn btn-icon"
//             style={{ marginLeft: 8, pointerEvents: "all" }}
//             onClick={() => setMobileOpen((v) => !v)}
//             aria-label={mobileOpen ? "Close menu" : "Open menu"}
//             aria-expanded={mobileOpen}
//           >
//             {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
//           </button>

//         </header>
//       </div>

//       {/* ── Mobile drawer ── */}
//       <AnimatePresence>
//         {mobileOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -8 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -8 }}
//             transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
//             style={{
//               position: "fixed",
//               top: scrolled ? 72 : 60,
//               left: scrolled ? 20 : 0,
//               right: scrolled ? 20 : 0,
//               zIndex: 99,
//               background: "var(--bg-surface)",
//               border: "1px solid var(--border-mid)",
//               borderRadius: scrolled ? 20 : "0 0 20px 20px",
//               padding: "12px",
//               boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
//               transition: reduce ? "none"
//                 : "top 0.35s ease, left 0.35s ease, right 0.35s ease, border-radius 0.35s ease",
//             }}
//           >
//             {/* Signed-in user row */}
//             {user && (
//               <div style={{
//                 display: "flex", alignItems: "center", gap: 10,
//                 padding: "10px 12px", marginBottom: 4,
//                 background: "var(--bg-elevated)", borderRadius: 12,
//                 border: "1px solid var(--border-subtle)",
//               }}>
//                 <Avatar user={user} size={32} />
//                 <div style={{ minWidth: 0, flex: 1 }}>
//                   <div style={{
//                     fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
//                     color: "var(--text-primary)",
//                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                   }}>{user.name}</div>
//                   <div style={{
//                     fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
//                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                   }}>{user.email}</div>
//                 </div>
//                 {user.readiness_score !== undefined && (
//                   <div style={{
//                     padding: "3px 10px", borderRadius: 100,
//                     background: "var(--accent-muted)",
//                     border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
//                     fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
//                     color: "var(--accent)", flexShrink: 0,
//                   }}>{user.readiness_score}</div>
//                 )}
//               </div>
//             )}

//             {/* Nav links */}
//             {NAV_LINKS.map((l) => (
//               <a key={l.href} href={l.href} className="nav-mobile-item"
//                 onClick={() => setMobileOpen(false)}>
//                 {l.label}
//               </a>
//             ))}

//             <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 4px" }} />

//             {user ? (
//               <>
//                 <Link href="/dashboard" className="nav-mobile-item"
//                   onClick={() => setMobileOpen(false)}>Dashboard</Link>
//                 <Link href="/auth/signout" className="nav-mobile-item"
//                   style={{ color: "var(--hard)" } as React.CSSProperties}
//                   onClick={() => setMobileOpen(false)}>Sign out</Link>
//               </>
//             ) : (
//               <>
//                 <Link href="/login" className="btn btn-ghost"
//                   style={{ justifyContent: "center", fontSize: 14, margin: "0 4px" }}
//                   onClick={() => setMobileOpen(false)}>Sign in</Link>
//                 <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
//                   className="btn btn-primary"
//                   style={{ justifyContent: "center", fontSize: 14, marginTop: 6, gap: 7 }}
//                   onClick={() => setMobileOpen(false)}>
//                   <ChromeIcon />Add to Chrome — Free
//                 </a>
//               </>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// // ─── Icons ────────────────────────────────────────────────────────────────────
// function ChromeIcon() {
//   return (
//     <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
//       <circle cx="7" cy="7" r="2.6" fill="currentColor"/>
//       <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4"
//         stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
//       <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4"
//         stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
//       <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4"
//         stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
//     </svg>
//   );
// }
// function HamburgerIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//       <path d="M2 4.5H14M2 8H14M2 11.5H14"
//         stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
//     </svg>
//   );
// }
// function CloseIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//       <path d="M3 3L13 13M13 3L3 13"
//         stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
//     </svg>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { NavUser } from "@/components/HomePageClient-6";

const GDRIVE_LINK = "https://drive.google.com/your-zip-link-here";

const NAV_LINKS = [
  { label: "Features",     href: "#features",     section: "features"    },
  { label: "How it works", href: "#how-it-works",  section: "how-it-works" },
  { label: "Analytics",    href: "#analytics",     section: "analytics"   },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 28 }: { user: NavUser; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "var(--accent-muted)",
      border: "1.5px solid color-mix(in srgb, var(--accent) 45%, transparent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {user.avatar_url && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt={user.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: size * 0.36,
          fontWeight: 700, color: "var(--accent)", lineHeight: 1,
        }}>{initials}</span>
      )}
    </div>
  );
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onClose }: { user: NavUser; onClose: () => void }) {
  const reduce = useReducedMotion();
  const menuItems = [
    { label: "Dashboard",      href: "/dashboard",            icon: "⊞" },
    { label: "My Problems",    href: "/dashboard/problems",   icon: "≡" },
    { label: "Revision Queue", href: "/dashboard/revision",   icon: "◷" },
    { label: "Analytics",      href: "/dashboard/analytics",  icon: "↗" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduce ? 0 : -6, scale: 0.96 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute", top: "calc(100% + 12px)", right: 0,
        width: 232,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-mid)",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px var(--border-subtle)",
        overflow: "hidden", zIndex: 200,
      }}
    >
      {/* Teal top line */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
      }} />

      {/* User header */}
      <div style={{
        padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Avatar user={user} size={34} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{user.name}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{user.email}</div>
        </div>
      </div>

      {/* Score row if available */}
      {user.readiness_score !== undefined && (
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
            Readiness score
          </span>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px",
            background: "var(--accent-muted)",
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            borderRadius: 100,
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>
              {user.readiness_score}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>/100</span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <div style={{ padding: "6px" }}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 10,
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: "var(--text-secondary)", textDecoration: "none",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--bg-hover)";
              el.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "var(--text-secondary)";
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: 6,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "var(--text-muted)", flexShrink: 0,
            }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "6px" }}>
        <Link href="/auth/signout" onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "8px 10px", borderRadius: 10,
            fontFamily: "var(--font-sans)", fontSize: 13,
            color: "var(--text-muted)", textDecoration: "none",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "color-mix(in srgb, var(--hard) 8%, transparent)";
            el.style.color = "var(--hard)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.color = "var(--text-muted)";
          }}
        >
          <span style={{
            width: 22, height: 22, borderRadius: 6,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, flexShrink: 0,
          }}>→</span>
          Sign out
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
interface NavbarProps { user?: NavUser | null; }

export default function Navbar({ user }: NavbarProps) {
  const [scrolled,    setScrolled]    = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const reduce  = useReducedMotion();

  // Mount flag for entrance animations
  useEffect(() => { setMounted(true); }, []);

  // Scroll → island morph
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section tracking via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_LINKS.forEach(({ section }) => {
      const el = document.getElementById(section);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(section); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Outside click closes dropdown
  useEffect(() => {
    if (!dropOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropOpen]);

  // ── Shared transition timing ──
  const ISLAND_TRANSITION = reduce ? "none"
    : "width 0.35s cubic-bezier(0.22,1,0.36,1), max-width 0.35s cubic-bezier(0.22,1,0.36,1), border-radius 0.35s cubic-bezier(0.22,1,0.36,1), padding 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, top 0.35s cubic-bezier(0.22,1,0.36,1)";

  return (
    <>
      <style>{`
        /* ── Mobile visibility ── */
        .nav-desktop    { display: none !important; }
        .nav-ctas       { display: none !important; }
        .nav-mobile-btn { display: flex !important; }

        @media (min-width: 768px) {
          .nav-desktop    { display: flex !important; }
          .nav-ctas       { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
        }

        /* ── Nav link base ── */
        .nav-link-text {
          font-family: var(--font-sans);
          font-size: 13px; font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          position: relative; z-index: 1;
          transition: color 0.15s ease;
          white-space: nowrap;
        }

        /* ── Mobile item ── */
        .nav-mobile-item {
          display: block; padding: 10px 12px;
          border-radius: 10px;
          font-family: var(--font-sans); font-size: 14px; font-weight: 500;
          color: var(--text-secondary); text-decoration: none;
          transition: all 0.15s ease;
        }
        .nav-mobile-item:hover {
          color: var(--text-primary); background: var(--bg-hover);
        }

        /* ── Avatar button ── */
        .nav-avatar-btn {
          display: flex; align-items: center; gap: 6px;
          background: transparent; border: none; cursor: pointer;
          padding: 4px 8px 4px 4px; border-radius: 100px;
          transition: background 0.15s ease;
        }
        .nav-avatar-btn:hover { background: var(--bg-hover); }

        .nav-chevron {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        .nav-chevron.open { transform: rotate(180deg); }

        /* ── Score chip ── */
        .nav-score-chip {
          display: flex; align-items: center; gap: 4px;
          padding: 4px 10px 4px 8px;
          background: var(--accent-muted);
          border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
          border-radius: 100px;
          cursor: default;
          transition: all 0.15s ease;
        }
        .nav-score-chip:hover {
          border-color: color-mix(in srgb, var(--accent) 40%, transparent);
          background: color-mix(in srgb, var(--accent) 10%, transparent);
        }
      `}</style>

      {/* ── Outer wrapper — always fixed, full-width ── */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        /* Top padding creates the float gap when scrolled */
        padding: scrolled ? "10px 20px 0" : "0",
        transition: reduce ? "none" : "padding 0.35s cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: "none", /* let clicks through the outer gap */
      }}>

        {/* ── The island ── */}
        <header style={{
          width: "100%",
          maxWidth: scrolled ? 980 : "100%",
          height: scrolled ? 52 : 60,
          borderRadius: scrolled ? 40 : 0,

          /* Background */
          background: scrolled
            ? "color-mix(in srgb, var(--bg-surface) 82%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",

          /* Border */
          border: scrolled
            ? "1px solid color-mix(in srgb, var(--accent) 18%, var(--border-mid))"
            : "1px solid transparent",

          /* Shadow */
          boxShadow: scrolled
            ? "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px var(--border-subtle) inset"
            : "none",

          /* Layout */
          display: "flex",
          alignItems: "center",
          paddingLeft:  scrolled ? "clamp(16px, 3vw, 28px)" : "clamp(16px, 4vw, 40px)",
          paddingRight: scrolled ? "clamp(16px, 3vw, 28px)" : "clamp(16px, 4vw, 40px)",
          position: "relative",

          transition: ISLAND_TRANSITION,
          pointerEvents: "all", /* re-enable on the bar itself */
        }}>

          {/* ── Logo ── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/" aria-label="Memoize home"
              style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <div style={{
                width: scrolled ? 28 : 32,
                height: scrolled ? 28 : 32,
                borderRadius: scrolled ? 8 : "var(--radius-md)",
                background: "var(--accent-muted)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transition: reduce ? "none" : "width 0.35s ease, height 0.35s ease, border-radius 0.35s ease",
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5L1 8L3 11"   stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 3L6 13"       stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{
                fontFamily: "var(--font-sans)", fontWeight: 600,
                fontSize: scrolled ? 15 : 16,
                letterSpacing: "-0.02em", color: "var(--text-primary)",
                transition: reduce ? "none" : "font-size 0.35s ease",
              }}>Memoize</span>
            </Link>
          </motion.div>

          {/* ── Desktop nav — absolutely centered ── */}
          <nav
            className="nav-desktop"
            style={{
              position: "absolute",
              left: "50%", transform: "translateX(-50%)",
              display: "flex", alignItems: "center",
              gap: 2,
            }}
            aria-label="Primary navigation"
          >
            {NAV_LINKS.map(({ label, href, section }, i) => {
              const isActive  = activeSection === section;
              const isHovered = hoveredLink === href;

              return (
                <motion.a
                  key={href}
                  href={href}
                  className="nav-link-text"
                  initial={reduce ? false : { opacity: 0, y: -5 }}
                  animate={mounted ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.08 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHoveredLink(href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    padding: "6px 13px",
                    borderRadius: 100,
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 5,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {/* Sliding background pill */}
                  {isHovered && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      style={{
                        position: "absolute", inset: 0,
                        borderRadius: 100,
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}

                  {/* Active section dot */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-dot"
                      style={{
                        width: 4, height: 4, borderRadius: "50%",
                        background: "var(--accent)",
                        boxShadow: "0 0 6px var(--accent)",
                        flexShrink: 0, position: "relative", zIndex: 1,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
                </motion.a>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          {/* ── Desktop right side ── */}
          <motion.div
            className="nav-ctas"
            style={{ alignItems: "center", gap: 8 }}
            initial={reduce ? false : { opacity: 0, y: -5 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {user ? (
              <>
                {/* Score chip */}
                {user.readiness_score !== undefined && (
                  <motion.div
                    className="nav-score-chip"
                    title={`Readiness score: ${user.readiness_score}/100`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.25, ease: "backOut" }}
                  >
                    {/* Pulsing dot */}
                    <motion.span
                      animate={reduce ? {} : { scale: [1, 1.4, 1], opacity: [0.9, 0.4, 0.9] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: "var(--accent)",
                        display: "inline-block", flexShrink: 0,
                      }}
                    />
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 12,
                      fontWeight: 700, color: "var(--accent)",
                    }}>{user.readiness_score}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9,
                      color: "var(--text-muted)",
                    }}>/100</span>
                  </motion.div>
                )}

                {/* Avatar + dropdown */}
                <div ref={dropRef} style={{ position: "relative" }}>
                  <button
                    className="nav-avatar-btn"
                    onClick={() => setDropOpen((v) => !v)}
                    aria-label="Profile menu" aria-expanded={dropOpen}
                  >
                    <Avatar user={user} size={28} />
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
                      color: "var(--text-primary)", maxWidth: 100,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{user.name.split(" ")[0]}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      className={`nav-chevron${dropOpen ? " open" : ""}`}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropOpen && (
                      <ProfileDropdown user={user} onClose={() => setDropOpen(false)} />
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost"
                  style={{ fontSize: 13, padding: "6px 14px" }}>
                  Sign in
                </Link>
                <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ fontSize: 13, padding: scrolled ? "5px 14px" : "6px 16px", gap: 7,
                    transition: "padding 0.35s ease" }}>
                  <ChromeIcon />
                  Add to Chrome
                </a>
              </>
            )}
          </motion.div>

          {/* ── Mobile hamburger ── */}
          <button
            className="nav-mobile-btn btn-icon"
            style={{ marginLeft: 8, pointerEvents: "all" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>

        </header>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: scrolled ? 72 : 60,
              left: scrolled ? 20 : 0,
              right: scrolled ? 20 : 0,
              zIndex: 99,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-mid)",
              borderRadius: scrolled ? 20 : "0 0 20px 20px",
              padding: "12px",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
              transition: reduce ? "none"
                : "top 0.35s ease, left 0.35s ease, right 0.35s ease, border-radius 0.35s ease",
            }}
          >
            {/* Signed-in user row */}
            {user && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", marginBottom: 4,
                background: "var(--bg-elevated)", borderRadius: 12,
                border: "1px solid var(--border-subtle)",
              }}>
                <Avatar user={user} size={32} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
                    color: "var(--text-primary)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{user.name}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{user.email}</div>
                </div>
                {user.readiness_score !== undefined && (
                  <div style={{
                    padding: "3px 10px", borderRadius: 100,
                    background: "var(--accent-muted)",
                    border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                    color: "var(--accent)", flexShrink: 0,
                  }}>{user.readiness_score}</div>
                )}
              </div>
            )}

            {/* Nav links */}
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="nav-mobile-item"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}

            <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 4px" }} />

            {user ? (
              <>
                <Link href="/dashboard" className="nav-mobile-item"
                  onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/auth/signout" className="nav-mobile-item"
                  style={{ color: "var(--hard)" } as React.CSSProperties}
                  onClick={() => setMobileOpen(false)}>Sign out</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost"
                  style={{ justifyContent: "center", fontSize: 14, margin: "0 4px" }}
                  onClick={() => setMobileOpen(false)}>Sign in</Link>
                <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ justifyContent: "center", fontSize: 14, marginTop: 6, gap: 7 }}
                  onClick={() => setMobileOpen(false)}>
                  <ChromeIcon />Add to Chrome — Free
                </a>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChromeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.6" fill="currentColor"/>
      <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5H14M2 8H14M2 11.5H14"
        stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3L13 13M13 3L3 13"
        stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}