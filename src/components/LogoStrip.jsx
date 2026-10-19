import BrandIcon from "./BrandIcon";
import { useProducts } from "../context/ProductContext";

// Slow-scrolling row of every tool we sell (decorative)


export default function LogoStrip() {
  const products = useProducts();
  const unique = products.filter((p, i, all) => all.findIndex((q) => q.name.split(" ")[0] === p.name.split(" ")[0]) === i);
  return (
    <div className="overflow-hidden border-y border-[color:var(--border)] bg-[color:var(--surface-2)]/60 py-3" aria-hidden="true">
      <div className="marquee">
        {[...unique, ...unique].map((p, i) => (
          <span key={i} className="mx-6 flex items-center gap-3 whitespace-nowrap text-slate-300">
            <BrandIcon name={p.slug} category={p.category} size={32} />
            <span className="font-semibold">{p.name.split(" ")[0]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
