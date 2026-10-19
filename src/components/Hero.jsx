import Icon from "./Icon";
import BrandIcon from "./BrandIcon";
import { useProducts } from "../context/ProductContext";
import { allCategories } from "../data/categories";
import { formatPrice } from "../utils/formatPrice";
import SalePrice from "./SalePrice";
import { useDiscounts } from "../context/DiscountContext";

const trust = [["bolt", "Fast Delivery"], ["lock", "Secure Ordering"], ["chat", "Customer Support"]];


const colorOf = (slug) => allCategories.find((c) => c.slug === slug)?.color;

export default function Hero({ onSelect }) {
  const products = useProducts();
  const { priceFor } = useDiscounts();
  const popular = products.filter((p) => p.popular).slice(0, 4);
  const lowestPrice = Math.min(...products.map((p) => priceFor(p).price));
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="hero-glow depth-1" aria-hidden="true" />
      <div className="grid-bg depth-2" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-16">
        <div className="fade-up">
          <div className="flex flex-wrap gap-2">
            <span className="eyebrow-pill">AI Tools • Premium Software • Productivity • Digital Services</span>
          <span className="price-pill">Plans from {formatPrice(lowestPrice)}</span>
          </div>
          <h1 className="gradient-text mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">Premium AI Tools. One Powerful Marketplace.</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">Get access to powerful AI, creative, developer, productivity and digital tools at affordable prices.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onSelect("ai-tools")} className="btn-primary w-full px-7 py-3.5 sm:w-auto">Explore AI Tools</button>
            <button onClick={() => onSelect("all")} className="btn-ghost w-full px-7 py-3.5 sm:w-auto">View All Products</button>
          </div>
          <ul className="mt-6 flex flex-wrap gap-5 text-sm">
            {trust.map(([icon, label]) => (
              <li key={label} className="flex items-center gap-2 text-[color:var(--accent)]"><Icon name={icon} size={18} /><span className="text-slate-300">{label}</span></li>
            ))}
          </ul>
        </div>

        <div className="relative depth-3">
          <div className="glass glow-border p-5 shadow-xl shadow-blue-900/10 dark:shadow-blue-900/30">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold">Popular right now</p>
              <a href="/#catalog" className="text-sm text-[color:var(--accent)] hover:underline">View all</a>
            </div>
            <ul className="space-y-3">
              {popular.map((p) => (
                <li key={p.slug}>
                  <a href={`/product/${p.slug}`} style={{ "--c": colorOf(p.category) }} className="card-hover flex flex-wrap items-center gap-3 min-[420px]:flex-nowrap rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3">
                    <BrandIcon name={p.slug} category={p.category} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-slate-400">{p.duration || p.limit}</span>
                    </span>
                    <span className="min-w-0 max-w-full text-right text-sm font-bold break-words sm:text-base"><SalePrice from={!!p.options} {...priceFor(p)} /></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <span className="glass float depth-4 absolute -bottom-6 left-8 hidden items-center gap-2 px-3 py-2 text-sm font-medium xl:flex"><span className="text-[color:var(--accent)]"><Icon name="bolt" size={16} /></span>Fast Delivery</span>
          <span className="glass float depth-4 absolute -bottom-6 right-8 hidden items-center gap-2 px-3 py-2 text-sm font-medium xl:flex" style={{ animationDelay: "1.5s" }}><span className="text-[color:var(--accent)]"><Icon name="chat" size={16} /></span>WhatsApp Support</span>
        </div>
      </div>
    </section>
  );
}
