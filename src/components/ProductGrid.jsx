import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { useProducts } from "../context/ProductContext";
import { allCategories } from "../data/categories";
import { providerNotice } from "../config";
import { useStock } from "../context/StockContext";
import { useDiscounts } from "../context/DiscountContext";

const priceRanges = { under1000: [0, 999], mid: [1000, 2500], high: [2501, 10000], premium: [10001, Infinity] };
const durationRanges = { short: (m) => m <= 2, medium: (m) => m >= 3 && m <= 6, long: (m) => m >= 12 };

function Select({ value, onChange, label, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className="field">
      {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
    </select>
  );
}

const PAGE = 12; // Only render a few product cards at once, on every catalogue page.
const categoryNames = Object.fromEntries(allCategories.map((c) => [c.slug, c.name]));

export default function ProductGrid({ category, setCategory, ratings = {}, showAll = false, compactTop = false }) {
  const products = useProducts();
  const { isOut } = useStock();
  const { hasDiscount, priceFor } = useDiscounts();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [price, setPrice] = useState("all");
  const [duration, setDuration] = useState("all");
  const [popularity, setPopularity] = useState("all");
  const [sort, setSort] = useState("featured");
  const [shown, setShown] = useState(PAGE);
  const sentinel = useRef(null);
  // Start again from the first batch whenever the search, filters or category change
  useEffect(() => { setShown(PAGE); }, [deferredSearch, price, duration, popularity, sort, category]);

  const productSearch = useMemo(() => products.map((p) => ({
    product: p, searchText: `${p.name} ${p.description} ${p.type || ""} ${p.duration || ""} ${p.limit || ""} ${categoryNames[p.category] || ""}`.toLowerCase(),
  })), [products]);
  // Search words are indexed once and filtering is only repeated when a filter changes.
  const visible = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    const result = productSearch.filter(({ product: p, searchText }) => {
      if (query && !searchText.includes(query)) return false;
      if (category === "discounts" ? !hasDiscount(p.slug) : category !== "all" && p.category !== category) return false;
      if (price !== "all" && (priceFor(p).price < priceRanges[price][0] || priceFor(p).price > priceRanges[price][1])) return false;
      if (duration !== "all" && !(p.months || []).some(durationRanges[duration])) return false;
      if (popularity === "popular" && !p.popular) return false;
      return true;
    }).map(({ product }) => product);
    if (sort === "featured") result.sort((a, b) => Number(isOut(a.slug)) - Number(isOut(b.slug)) || Number(!!b.popular) - Number(!!a.popular));
    else if (sort === "low") result.sort((a, b) => priceFor(a).price - priceFor(b).price);
    else if (sort === "high") result.sort((a, b) => priceFor(b).price - priceFor(a).price);
    else if (sort === "newest") result.reverse();
    return result;
  }, [category, deferredSearch, price, duration, popularity, sort, isOut, hasDiscount, priceFor, productSearch]);

  // Draw the next batch shortly before the visitor reaches the end of the list
  useEffect(() => {
    if (!sentinel.current || shown >= visible.length) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) setShown((n) => n + PAGE); }, { rootMargin: "800px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [shown, visible.length]);

  return (
    <section id="catalog" className={`mx-auto max-w-7xl px-5 ${compactTop ? "pt-5 pb-10 lg:pt-6 lg:pb-12" : "py-8 lg:py-10"}`}>
      <p className="eyebrow">Shop</p>
<h2 className="section-title">Product Catalog</h2>
      <p className="mt-2 text-sm text-slate-400">{providerNotice}</p>

      <input id="product-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products, e.g. ChatGPT, video, Canva, developer" className="field mt-6" />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {[{ slug: "all", name: "All" }, ...allCategories].map((c) => (
          <button key={c.slug} onClick={() => setCategory(c.slug)}
            className={`chip shrink-0 cursor-pointer transition ${category === c.slug ? "chip-active" : "hover:bg-[color:var(--hover)]"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Select label="Price" value={price} onChange={setPrice} options={[["all", "Any price"], ["under1000", "Under Rs. 1,000"], ["mid", "Rs. 1,000 – 2,500"], ["high", "Rs. 2,501 – 10,000"], ["premium", "Over Rs. 10,000"]]} />
        <Select label="Duration" value={duration} onChange={setDuration} options={[["all", "Any duration"], ["short", "Up to 2 months"], ["medium", "3 – 6 months"], ["long", "1 year or more"]]} />
        <Select label="Popularity" value={popularity} onChange={setPopularity} options={[["all", "All products"], ["popular", "Popular only"]]} />
        <Select label="Sort by" value={sort} onChange={setSort} options={[["featured", "Featured"], ["low", "Price: Low to High"], ["high", "Price: High to Low"], ["newest", "Newest"]]} />
      </div>

      <p className="mt-4 text-sm text-slate-400">{visible.length} product{visible.length === 1 ? "" : "s"}</p>

      {visible.length === 0 ? (
        <p className="glass mt-4 p-8 text-center text-slate-300">No products match your search. Try a different word or clear a filter.</p>
      ) : (
        <>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.slice(0, shown).map((p) => <ProductCard key={p.slug} product={p} rating={ratings[p.slug]} />)}
          </div>
          {shown < visible.length && (
            <div ref={sentinel} className="mt-8 min-h-14 text-center">
              <button onClick={() => setShown((n) => n + PAGE)} className="btn-ghost">Show more products ({visible.length - shown} more)</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
