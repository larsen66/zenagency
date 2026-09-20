// DOM compositing adaptation of the CRT look at:
// https://gingerbeardman.github.io/webgl-crt-shader/
export function HeroCrtFilter({ id }: { id: string }) {
  return <filter id={id} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
    <feOffset in="red" dx="0.6" result="redShift" />
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
    <feOffset in="cyan" dx="-0.6" result="cyanShift" />
    <feComposite in="redShift" in2="cyanShift" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="rgb" />
    <feGaussianBlur in="rgb" stdDeviation="0.8" result="soft" />
    <feComponentTransfer in="soft" result="glow">
      <feFuncR type="linear" slope="0.12" />
      <feFuncG type="linear" slope="0.12" />
      <feFuncB type="linear" slope="0.12" />
    </feComponentTransfer>
    <feBlend in="rgb" in2="glow" mode="screen" />
  </filter>;
}
