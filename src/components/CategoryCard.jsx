import Icon from "./Icon";
import BrandIcon from "./BrandIcon";
import { useProducts } from "../context/ProductContext";
import SalePrice from "./SalePrice";
import { useDiscounts } from "../context/DiscountContext";
import { brandIcons } from "../data/brandIcons";
import { logoFiles } from "../data/logoFiles";

export default function CategoryCard({ category, large = false, className = "" }) {
  const products = useProducts();
  const { hasDiscount, priceFor } = useDiscounts();
  const items = products.filter((p) => category.slug === "discounts" ? hasDiscount(p.slug) : p.category === category.slug);
  const topItems = [...items].sort((a, b) => Number(!!b.popular) - Number(!!a.popular));

  // Logo row: one logo per brand (no repeats, no placeholder icons)
  const seen = new Set();
  const logos = items.filter((p) => {
    const key = brandIcons[p.slug]?.title ?? (logoFiles[p.slug] ? p.slug : null);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <a href={`/${category.slug}`} style={{ "--c": category.color }} className={`glass card-hover card-wash group flex min-w-0 flex-col justify-between p-5 ${large ? "lg:p-7" : ""} ${className}`}>
      <div>
        <span className="tile" style={large ? { width: 60, height: 60 } : undefined}><Icon name={category.slug} size={large ? 28 : 22} /></span>
        <h3 className={`mt-4 font-bold ${large ? "text-3xl lg:text-4xl" : "text-xl"}`}>{category.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{category.tools}</p>
        {large && (
          <ul className="mt-4 hidden space-y-2 lg:block">
            {topItems.slice(0, 3).map((p) => (
              <li key={p.slug} className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]/70 p-2.5">
                <BrandIcon name={p.slug} category={p.category} size={34} />
                <span className="flex-1 text-sm font-semibold">{p.name}</span>
                <span className="text-sm font-bold"><SalePrice from={!!p.options} {...priceFor(p)} /></span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="flex min-w-0 -space-x-2 overflow-hidden">
          {logos.slice(0, large ? 6 : 4).map((p) => <span key={p.slug} className="rounded-xl ring-2 ring-[color:var(--surface)]"><BrandIcon name={p.slug} category={p.category} size={large ? 40 : 32} /></span>)}
        </span>
        <span className="shrink-0 whitespace-nowrap text-sm font-semibold transition group-hover:translate-x-1" style={{ color: category.color }}>{items.length} products →</span>
      </div>
    </a>
  );
}
