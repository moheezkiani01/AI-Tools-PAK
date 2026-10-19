import { useState } from "react";
import Icon from "./Icon";
import BrandIcon from "./BrandIcon";
import { useProducts } from "../context/ProductContext";
import { allCategories } from "../data/categories";
import SalePrice from "./SalePrice";
import { useDiscounts } from "../context/DiscountContext";
import { useStock } from "../context/StockContext";

const needs = [
  { label: "Write, research & code", icon: "ai-tools", picks: ["chatgpt-plus", "claude-pro", "gemini-pro", "supergrok"] },
  { label: "Make images, video & voice", icon: "creative-tools", picks: ["runway-ml-pro", "veo-3-ultra", "leonardo-ai", "elevenlabs"] },
  { label: "Design & presentations", icon: "productivity", picks: ["canva-pro-edu", "figma-pro-private", "adobe-creative", "gamma-pro"] },
  { label: "Build apps & automate", icon: "developer-tools", picks: ["lovable-pro", "replit-core", "n8n-starter", "manus-ai-pro"] },
  { label: "Write & study better", icon: "professional", picks: ["grammarly-premium", "quillbot", "jasper-ai", "coursera-premium"] },
  { label: "Marketing & SEO", icon: "marketing-tools", picks: ["semrush-pro", "vidiq", "helium-10-platinum", "success-ai-starter"] },
  { label: "Stay private online", icon: "vpn-security", picks: ["nordvpn", "surfshark-vpn"] },
  { label: "Watch & relax", icon: "entertainment", picks: ["netflix", "prime-video", "youtube-premium"] },
];
const colorOf = (slug) => allCategories.find((c) => c.slug === slug)?.color;

export default function ToolFinder() {
  const products = useProducts();
  const [active, setActive] = useState(0);
  const { isOut } = useStock();
  const { priceFor } = useDiscounts();
  const picks = needs[active].picks.map((slug) => products.find((p) => p.slug === slug));

  return (
    <section id="finder" className="mx-auto max-w-7xl px-5 pt-5 pb-8 sm:pt-6 sm:pb-10">
      <p className="eyebrow">Find your tool</p>
      <h2 className="section-title">What do you want to do?</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {needs.map((need, i) => (
          <button key={need.label} onClick={() => setActive(i)} aria-pressed={i === active}
            className={`chip flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition ${i === active ? "chip-active" : "hover:bg-[color:var(--hover)]"}`}>
            <Icon name={need.icon} size={16} />{need.label}
          </button>
        ))}
      </div>
      <div key={active} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((p) => (
          <a key={p.slug} href={`/product/${p.slug}`} style={{ "--c": colorOf(p.category) }} className="glass card-hover card-wash fade-up flex flex-col gap-4 p-4">
            <span className="flex items-start justify-between">
              <BrandIcon name={p.slug} category={p.category} size={48} />
              <span className="text-right font-bold">
                <SalePrice from={!!p.options} {...priceFor(p)} />
              </span>
            </span>
            <span>
              <span className="block font-bold leading-tight">{p.name}</span>
              <span className="mt-1 block text-xs text-slate-400">{isOut(p.slug) ? "Out of stock" : p.options ? "Several plans" : p.duration || p.limit}</span>
            </span>
          </a>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Suggestions only. Check each product's details for its plan, limits and provider terms.</p>
    </section>
  );
}
