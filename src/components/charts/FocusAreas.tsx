// "use client";

// import Link from "next/link";
// import { PatternStat, TagStat } from "@/types";

// interface FocusAreasProps {
//   patterns: PatternStat[];
//   tags: TagStat[];
//   delay?: number;
// }

// function encodeParam(value: string): string {
//   return encodeURIComponent(value);
// }

// export function FocusAreas({ patterns, tags, delay = 0 }: FocusAreasProps) {
//   // Weakest patterns: avg_confidence < 0.65, at least 1 problem, sorted by confidence asc
//   const weakPatterns = patterns
//     .filter(p => p.avg_confidence < 0.65 && p.count >= 1)
//     .sort((a, b) => a.avg_confidence - b.avg_confidence)
//     .slice(0, 3);

//   // Weakest tags with low confidence count, as backup
//   const weakTags = tags
//     .filter(t => t.low_confidence_count >= 1 && t.avg_confidence < 0.5)
//     .sort((a, b) => b.low_confidence_count - a.low_confidence_count)
//     .slice(0, 3);

//   const hasWeakAreas = weakPatterns.length > 0 || weakTags.length > 0;

//   if (!hasWeakAreas) {
//     // Everything is strong — show a positive signal
//     return (
//       <div
//         className="animate-fade-in"
//         style={{
//           animationDelay: `${delay}ms`,
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//           padding: "14px 20px",
//           background: "color-mix(in srgb, var(--easy) 6%, var(--bg-elevated))",
//           border: "1px solid color-mix(in srgb, var(--easy) 20%, var(--border-subtle))",
//           borderRadius: "var(--radius-lg)",
//         }}
//       >
//         <div style={{
//           width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
//           background: "color-mix(in srgb, var(--easy) 12%, transparent)",
//           border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           color: "var(--easy)",
//         }}>
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//         </div>
//         <div>
//           <div style={{ fontSize: 13, fontWeight: 600, color: "var(--easy)" }}>Strong across all areas</div>
//           <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
//             No significant weak spots. Keep solving harder problems to maintain momentum.
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="card animate-fade-in"
//       style={{
//         padding: "18px 22px",
//         animationDelay: `${delay}ms`,
//         background: "color-mix(in srgb, var(--medium) 4%, var(--bg-surface))",
//         borderColor: "color-mix(in srgb, var(--medium) 20%, var(--border-subtle))",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* Ambient */}
//       <div style={{
//         position: "absolute", top: -20, right: -20,
//         width: 80, height: 80, borderRadius: "50%",
//         background: "var(--medium)", opacity: 0.05,
//         filter: "blur(20px)", pointerEvents: "none",
//       }} />

//       <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
//         {/* Icon */}
//         <div style={{
//           width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
//           background: "color-mix(in srgb, var(--medium) 12%, transparent)",
//           border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           color: "var(--medium)", marginTop: 1,
//         }}>
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <circle cx="12" cy="12" r="10"/>
//             <line x1="12" y1="8" x2="12" y2="12"/>
//             <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/>
//           </svg>
//         </div>

//         <div style={{ flex: 1 }}>
//           <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
//             Focus Areas
//           </div>
//           <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
//             Patterns and tags where your confidence is lowest — review these next.
//           </div>

//           {/* Weak pattern chips */}
//           {weakPatterns.length > 0 && (
//             <div style={{ marginBottom: weakTags.length > 0 ? 10 : 0 }}>
//               <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
//                 Patterns
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                 {weakPatterns.map(p => {
//                   const confColor = p.avg_confidence < 0.3 ? "var(--hard)" : "var(--medium)";
//                   return (
//                     <Link
//                       key={p.pattern}
//                       href={`/dashboard/problems?pattern=${encodeParam(p.pattern)}`}
//                       style={{
//                         display: "inline-flex",
//                         alignItems: "center",
//                         gap: 6,
//                         fontSize: 12,
//                         fontWeight: 500,
//                         color: confColor,
//                         background: `color-mix(in srgb, ${confColor} 10%, transparent)`,
//                         border: `1px solid color-mix(in srgb, ${confColor} 28%, transparent)`,
//                         borderRadius: "var(--radius-pill)",
//                         padding: "4px 10px",
//                         textDecoration: "none",
//                         transition: "all 0.15s ease",
//                       }}
//                       onMouseEnter={e => {
//                         e.currentTarget.style.background = `color-mix(in srgb, ${confColor} 18%, transparent)`;
//                       }}
//                       onMouseLeave={e => {
//                         e.currentTarget.style.background = `color-mix(in srgb, ${confColor} 10%, transparent)`;
//                       }}
//                     >
//                       {p.pattern}
//                       <span style={{
//                         fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
//                         opacity: 0.8,
//                       }}>
//                         {p.count}
//                       </span>
//                       {/* Arrow */}
//                       <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                         <polyline points="9 18 15 12 9 6"/>
//                       </svg>
//                     </Link>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Weak tag chips */}
//           {weakTags.length > 0 && (
//             <div>
//               <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
//                 Tags with low-confidence problems
//               </div>
//               <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                 {weakTags.map(t => (
//                   <Link
//                     key={t.tag}
//                     href={`/dashboard/problems?tags=${encodeParam(t.tag)}&confidence=low`}
//                     style={{
//                       display: "inline-flex",
//                       alignItems: "center",
//                       gap: 5,
//                       fontSize: 12,
//                       fontWeight: 500,
//                       color: "var(--hard)",
//                       background: "color-mix(in srgb, var(--hard) 8%, transparent)",
//                       border: "1px solid color-mix(in srgb, var(--hard) 22%, transparent)",
//                       borderRadius: "var(--radius-pill)",
//                       padding: "4px 10px",
//                       textDecoration: "none",
//                       transition: "all 0.15s ease",
//                     }}
//                     onMouseEnter={e => {
//                       e.currentTarget.style.background = "color-mix(in srgb, var(--hard) 15%, transparent)";
//                     }}
//                     onMouseLeave={e => {
//                       e.currentTarget.style.background = "color-mix(in srgb, var(--hard) 8%, transparent)";
//                     }}
//                   >
//                     {t.tag}
//                     <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
//                       {t.low_confidence_count} low
//                     </span>
//                     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                       <polyline points="9 18 15 12 9 6"/>
//                     </svg>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import Link from "next/link";
import { PatternStat, TagStat } from "@/types";

interface FocusAreasProps {
  patterns: PatternStat[];
  tags: TagStat[];
  delay?: number;
}

function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

function formatLabel(s: string): string {
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function FocusAreas({ patterns, tags, delay = 0 }: FocusAreasProps) {
  // Weakest patterns: avg_confidence < 0.65, at least 1 problem, sorted by confidence asc
  const weakPatterns = patterns
    .filter(p => p.avg_confidence < 0.65 && p.count >= 1)
    .sort((a, b) => a.avg_confidence - b.avg_confidence)
    .slice(0, 3);

  // Weakest tags with low confidence count, as backup
  const weakTags = tags
    .filter(t => t.low_confidence_count >= 1 && t.avg_confidence < 0.5)
    .sort((a, b) => b.low_confidence_count - a.low_confidence_count)
    .slice(0, 3);

  const hasWeakAreas = weakPatterns.length > 0 || weakTags.length > 0;

  if (!hasWeakAreas) {
    // Everything is strong — show a positive signal
    return (
      <div
        className="animate-fade-in"
        style={{
          animationDelay: `${delay}ms`,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          background: "color-mix(in srgb, var(--easy) 6%, var(--bg-elevated))",
          border: "1px solid color-mix(in srgb, var(--easy) 20%, var(--border-subtle))",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
          background: "color-mix(in srgb, var(--easy) 12%, transparent)",
          border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--easy)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--easy)" }}>Strong across all areas</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
            No significant weak spots. Keep solving harder problems to maintain momentum.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "18px 22px",
        animationDelay: `${delay}ms`,
        background: "color-mix(in srgb, var(--medium) 4%, var(--bg-surface))",
        borderColor: "color-mix(in srgb, var(--medium) 20%, var(--border-subtle))",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient */}
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: "var(--medium)", opacity: 0.05,
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
          background: "color-mix(in srgb, var(--medium) 12%, transparent)",
          border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--medium)", marginTop: 1,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/>
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
            Focus Areas
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Patterns and tags where your confidence is lowest — review these next.
          </div>

          {/* Weak pattern chips */}
          {weakPatterns.length > 0 && (
            <div style={{ marginBottom: weakTags.length > 0 ? 10 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                Patterns
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {weakPatterns.map(p => {
                  const confColor = p.avg_confidence < 0.3 ? "var(--hard)" : "var(--medium)";
                  return (
                    <Link
                      key={formatLabel(p.pattern)}
                      href={`/dashboard/problems?pattern=${encodeParam(p.pattern)}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 500,
                        color: confColor,
                        background: `color-mix(in srgb, ${confColor} 10%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${confColor} 28%, transparent)`,
                        borderRadius: "var(--radius-pill)",
                        padding: "4px 10px",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `color-mix(in srgb, ${confColor} 18%, transparent)`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = `color-mix(in srgb, ${confColor} 10%, transparent)`;
                      }}
                    >
                      {formatLabel(p.pattern)}
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                        opacity: 0.8,
                      }}>
                        {p.count}
                      </span>
                      {/* Arrow */}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weak tag chips */}
          {weakTags.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                Tags with low-confidence problems
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {weakTags.map(t => (
                  <Link
                    key={formatLabel(t.tag)}
                    href={`/dashboard/problems?tags=${encodeParam(t.tag)}&confidence=low`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--hard)",
                      background: "color-mix(in srgb, var(--hard) 8%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--hard) 22%, transparent)",
                      borderRadius: "var(--radius-pill)",
                      padding: "4px 10px",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "color-mix(in srgb, var(--hard) 15%, transparent)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "color-mix(in srgb, var(--hard) 8%, transparent)";
                    }}
                  >
                    {formatLabel(t.tag)}
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
                      {t.low_confidence_count} low
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}