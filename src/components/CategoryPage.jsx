import { useEffect } from "react";
import ProductGrid from "./ProductGrid";
import { allCategories } from "../data/categories";
import { navigate } from "../utils/navigate";
import { brand } from "../config";

// One real page per category, plus /products for everything.
// Switching category keeps your place on the screen (see App.jsx), so the list simply changes where you are.
export default function CategoryPage({ slug, ratings }) {
  const all = slug === "all";
  const category = all ? { name: "All Products", tools: "" } : allCategories.find((c) => c.slug === slug);
  const heading = all ? "All AI Tools & Subscriptions in Pakistan" : `${category.name} in Pakistan`;

  useEffect(() => {
    const oldTitle = document.title;
    document.title = `${heading} | ${brand.name}`;
    return () => { document.title = oldTitle; };
  }, [heading]);

  return (
    <>
      <header className="mx-auto max-w-7xl px-5 pt-10">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{heading}</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{category.tools ? `${category.tools}. ` : ""}Affordable subscriptions with ordering support on WhatsApp.</p>
      </header>
      <ProductGrid category={slug} setCategory={(s) => navigate(s === "all" ? "/products" : `/${s}`)} ratings={ratings} showAll={!all} compactTop />
    </>
  );
}
