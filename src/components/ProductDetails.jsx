import Icon, { Stars } from "./Icon";
import { navigate } from "../utils/navigate";
import { useEffect, useState } from "react";
import { useProducts } from "../context/ProductContext";
import { allCategories } from "../data/categories";
import { compareGroups } from "../data/compare";
import { useCartActions } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import SalePrice from "./SalePrice";
import { useDiscounts } from "../context/DiscountContext";
import { orderOnWhatsApp, whatsappLink } from "../utils/whatsapp";
import { useStock } from "../context/StockContext";
import BrandIcon from "./BrandIcon";

import { brand, providerNotice } from "../config";

function Section({ title, children }) {
  return (
    <section className="glass p-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-300">{children}</div>
    </section>
  );
}

export default function ProductDetails({ slug }) {
  const products = useProducts();
  const product = products.find((p) => p.slug === slug);
  const { addItem, setIsOpen } = useCartActions();
  const out = useStock().isOut(slug);
  const { priceFor } = useDiscounts();
  const [optionIndex, setOptionIndex] = useState(0);
  const [rating, setRating] = useState({ count: 0, average: 0 });
  useEffect(() => {
    let active = true;
    fetch(`/api/reviews/${encodeURIComponent(slug)}`).then((r) => r.json()).then((data) => { if (active) setRating(data); }).catch(() => {});
    return () => { active = false; };
  }, [slug]);

  // Product metadata for SEO / sharing
  useEffect(() => {
    if (!product) return;
    const meta = document.querySelector('meta[name="description"]');
    const oldTitle = document.title;
    const oldDescription = meta?.getAttribute("content");
    document.title = `${product.name} in Pakistan | ${brand.name}`;
    meta?.setAttribute("content", `${product.name}: ${product.description}`);
    return () => { document.title = oldTitle; meta?.setAttribute("content", oldDescription); };
  }, [product]);

  if (!product) {
    return <p className="mx-auto max-w-3xl px-5 py-12 text-center">Product not found. <a href="/" className="underline">Back to shop</a></p>;
  }

  const category = allCategories.find((c) => c.slug === product.category);
  const group = compareGroups.find((g) => g.products.includes(slug));
  const option = product.options?.[optionIndex];
  const { original, price, onSale } = priceFor(product, option);
  const plan = option?.label ?? product.duration;
  const message = `Hello, I want to purchase ${product.name}${plan ? ` (${plan})` : ""} for ${formatPrice(price)}.`;

  const buyNow = () => { addItem(product, option); navigate("/checkout"); };
  const addToCart = () => { addItem(product, option); setIsOpen(true); };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-28 lg:pb-9" style={{ "--c": category.color }}>
      <a href="/" className="text-sm text-slate-400 hover:text-[color:var(--text)]">← Back to all products</a>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <BrandIcon name={slug} category={product.category} size={72} />
            <span className="chip text-sm">{category.name}</span>
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl">{product.name}</h1>
          <a href={`/product/${slug}/reviews`} className="inline-flex w-fit items-center gap-2 rounded text-sm text-slate-300 hover:text-amber-400"><Stars value={rating.average} size={17} /> {rating.count ? `${rating.average} (${rating.count} reviews)` : "Be the first to review"} · Write a review →</a>
          <p className="max-w-2xl text-lg text-slate-300">{product.description}</p>
          {group && <p className="text-sm"><a href={`/compare/${group.slug}`} className="font-semibold text-[color:var(--accent)] hover:underline">Compare similar plans: {group.short} →</a></p>}

          <Section title="Features & What's Included">
            <ul className="list-disc space-y-1 pl-5">
              {plan && <li>Plan: {plan}</li>}
              {product.type && <li>Type: {product.type}</li>}
              {product.limit && <li>{product.limit}</li>}
              {(product.features || []).map((feature, i) => <li key={i}>{feature}</li>)}
              <li>Order confirmation and delivery details through WhatsApp or email</li>
            </ul>
            <p className="text-slate-400">Exact features are set by the provider and can change over time.</p>
          </Section>
          <Section title="Delivery Information">
            <p>{product.delivery || "Delivery is within 10 minutes after your payment is confirmed. Access details are shared through WhatsApp or email."}</p>
            <p>We confirm on WhatsApp how your access will be delivered before you pay.</p>
          </Section>
          <Section title="Terms & Conditions">
            <p>{providerNotice}</p>
            <p>Availability, account eligibility, features and terms can depend on the underlying provider.</p>
            {product.terms && <p>{product.terms}</p>}
            <p><a href="/terms" className="underline">Read the full Terms & Conditions</a></p>
          </Section>
          <Section title="FAQ">
            <details><summary>How do I pay?</summary><p className="mt-1">After you order, we share the payment details on WhatsApp. You can pay by JazzCash, UBL bank transfer or Binance.</p></details>
            <details><summary>How do I get access?</summary><p className="mt-1">Access details are shared after payment is confirmed.</p></details>
            <details><summary>Can I change my plan later?</summary><p className="mt-1">Message us on WhatsApp. It depends on availability and the provider's terms.</p></details>
          </Section>
          <a href={`/product/${slug}/reviews`} className="glass block p-6 text-lg font-bold hover:underline">Ratings, customer comments &amp; reviews →</a>
        </div>

        <aside className="glass card-wash h-fit space-y-4 p-6 lg:sticky lg:top-24">
          {product.options && (
            <div>
              <p className="mb-2 text-sm text-slate-300">Choose a plan</p>
              <div className="flex flex-wrap gap-2">
                {product.options.map((o, i) => (
                  <button key={o.label} onClick={() => setOptionIndex(i)} className={`chip cursor-pointer ${i === optionIndex ? "chip-active" : ""}`}>{o.label}</button>
                ))}
              </div>
            </div>
          )}
          {onSale && <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">Special offer</span>}
          <p className="font-display text-4xl font-extrabold"><SalePrice original={original} price={price} /></p>
          {plan && <p className="text-sm text-slate-400">{plan}</p>}
          {out ? (
            <>
              <p className="rounded-xl bg-amber-500/10 p-3 text-sm font-semibold text-amber-700 dark:text-amber-400">Currently out of stock</p>
              <a href={whatsappLink(`Hello, is ${product.name} available?`)} target="_blank" rel="noreferrer" className="btn-ghost block w-full">Ask on WhatsApp</a>
            </>
          ) : (
            <>
          <button onClick={buyNow} className="btn-primary w-full">Buy Now</button>
          <button onClick={addToCart} className="btn-ghost w-full">Add to Cart</button>
          <button onClick={() => orderOnWhatsApp(message, product.name)} className="btn-ghost w-full">Order on WhatsApp</button>
            </>
          )}
          <ul className="space-y-2 border-t border-[color:var(--border)] pt-4 text-sm text-slate-400">
            {[["lock", "Secure ordering"], ["chat", "Support on WhatsApp"], ["box", "Digital delivery after payment is confirmed"]].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-2"><span className="text-[color:var(--accent)]"><Icon name={icon} size={16} /></span>{text}</li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[color:var(--border)] bg-[color:var(--surface)] p-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-slate-400">{plan || product.name}</p>
          <p className="break-words text-base font-extrabold min-[360px]:text-lg"><SalePrice original={original} price={price} /></p>
        </div>
        {out ? <span className="chip shrink-0 px-2 py-2 text-xs min-[360px]:px-4 min-[360px]:text-sm">Out of stock</span> : <button onClick={buyNow} className="btn-primary shrink-0 px-4 min-[360px]:px-6">Buy Now</button>}
      </div>
    </div>
  );
}
