import Icon from "./Icon";
import { brandIcons } from "../data/brandIcons";
import { logoFiles } from "../data/logoFiles";

// Order: 1) your own file in public/logos  2) built-in logo in public/brand-icons  3) plain category icon.
// Logos are lazy-loaded images, so cards further down the page cost nothing until you scroll near them.
export default function BrandIcon({ name, category, size = 44 }) {
  const brand = brandIcons[name];
  const own = logoFiles[name];
  const box = { width: size, height: size, borderRadius: size * 0.28 };

  if (own) {
    return (
      <span className="inline-grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-slate-900/10" style={box}>
        <img src={`/logos/${name}.${own}`} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain p-1.5" />
      </span>
    );
  }
  if (brand) {
    return (
      <span className="inline-grid shrink-0 place-items-center bg-white ring-1 ring-slate-900/10" style={box} title={brand.title}>
        <img src={`/brand-icons/${name}.svg`} alt="" loading="lazy" decoding="async" width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} />
      </span>
    );
  }
  return <span className="tile" style={box}><Icon name={category} size={Math.round(size * 0.5)} /></span>;
}
