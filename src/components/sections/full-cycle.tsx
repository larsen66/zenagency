import { fullCycle } from "@/lib/content";
import styles from "./full-cycle.module.css";

const folders = [
  { label: fullCycle.folders[0].label, x: 550, y: 678, path: "M-20 679H218C259 679 241 596 292 596H818C865 596 846 678 889 678L1427 672V1760H-20Z", tone: "#292928" },
  { label: fullCycle.folders[1].label, x: 987, y: 876, path: "M60 1760V972C60 916 77 877 128 877H649C692 877 675 793 722 793H1242C1288 793 1270 875 1317 875H1427V1760Z", tone: "var(--lime)" },
  { label: fullCycle.folders[2].label, x: 455, y: 1080, path: "M-20 1090H123C164 1090 148 1007 200 1007H713C763 1007 745 1087 790 1087L1310 1083C1357 1083 1339 1147 1384 1165V1760H-20Z", tone: "#2b2c2c" },
  { label: fullCycle.folders[3].label, x: 671, y: 1292, path: "M-20 1299H343C384 1299 368 1215 418 1215H930C980 1215 963 1297 1010 1297H1427V1780H-20Z", tone: "var(--lime)" },
];

export function FullCycle() {
  return (
    <section id="full-cycle" className={styles.section} lang="en" aria-labelledby="full-cycle-title">
      <div className={styles.layout}>
        <div className={styles.intro}>
        <div className={styles.brand} aria-label="ZEN Marketing Agency">
          <span className={styles.mark} />
          <span className={styles.wordmark}>Marketing Agency</span>
        </div>
        <h2 id="full-cycle-title" className={styles.title}>
          {fullCycle.title}
        </h2>
        <p className={styles.cta}>{fullCycle.cta}</p>
        </div>
        <div className={styles.poster}>
        <svg className={styles.artwork} viewBox="0 560 1407 1100" fill="none" aria-hidden="true">
          <defs>
            <filter id="full-cycle-paper" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".38" numOctaves="3" stitchTiles="stitch" seed="12" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="multiply" />
            </filter>
            <filter id="full-cycle-fibers" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency=".025 .045" numOctaves="4" stitchTiles="stitch" seed="8" />
              <feColorMatrix type="saturate" values="0" />
              <feBlend in="SourceGraphic" mode="multiply" />
            </filter>
            <pattern id="full-cycle-grid" width="165" height="165" patternUnits="userSpaceOnUse" x="125" y="138">
              <path d="M0 165V0H165" stroke="var(--lime)" strokeWidth="3" />
            </pattern>
            <linearGradient id="full-cycle-metal" x1="0" y1="0" x2="1" y2="0">
              <stop stopColor="#111" /><stop offset=".35" stopColor="#fff" /><stop offset=".55" stopColor="#aaa" /><stop offset="1" stopColor="#111" />
            </linearGradient>
            <filter id="full-cycle-clip-shadow" x="-50%" y="-30%" width="200%" height="180%">
              <feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity=".65" />
            </filter>
            {folders.map((folder, i) => <clipPath id={`full-cycle-folder-${i}`} key={folder.label}><path d={folder.path} /></clipPath>)}
          </defs>
          {folders.map((folder, i) => (
            <g key={folder.label}>
              <path d={folder.path} fill={folder.tone} />
              <g clipPath={`url(#full-cycle-folder-${i})`} opacity=".38">
                <rect y="590" width="1407" height="1190" fill={folder.tone} filter="url(#full-cycle-paper)" />
                <rect y="590" width="1407" height="1190" fill={folder.tone} filter="url(#full-cycle-fibers)" opacity=".6" />
              </g>
              <path d={`M${folder.x - 245} ${folder.y + 93}h510q30 0 37 -28l9 -32`} stroke="#111" strokeOpacity=".25" strokeWidth="2" strokeDasharray="110 7 24 4" />
              <Paperclip x={[265, 693, 167, 366][i]} y={[764, 960, 1176, 1382][i]} />
            </g>
          ))}
        </svg>
        <ol className={styles.labels}>
          {folders.map((folder) => <li key={folder.label} style={{ left: `${folder.x / 14.07}%`, top: `${(folder.y - 560) / 11}%` }}>{folder.label}</li>)}
        </ol>
        </div>
      </div>
    </section>
  );
}

function Paperclip({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(28 25 85)`} filter="url(#full-cycle-clip-shadow)">
      <path d="M12 40V143C12 178 55 178 55 143V22C55 -6 22 -6 22 22V140C22 159 44 159 44 140V44" stroke="#101010" strokeWidth="6" strokeLinecap="round" />
      <path d="M12 40V143C12 178 55 178 55 143V22C55 -6 22 -6 22 22V140C22 159 44 159 44 140V44" stroke="url(#full-cycle-metal)" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}
