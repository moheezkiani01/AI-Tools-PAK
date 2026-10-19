import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CartProvider } from "./context/CartContext";
import { StockProvider } from "./context/StockContext";
import { DiscountProvider } from "./context/DiscountContext";
import { ProductProvider } from "./context/ProductContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategoryCard from "./components/CategoryCard";
import ProductGrid from "./components/ProductGrid";
import HowItWorks from "./components/HowItWorks";
import OrdersChart from "./components/OrdersChart";
import WhyChoose from "./components/WhyChoose";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AnnouncementBar from "./components/AnnouncementBar";
import { infoPages } from "./data/infoPages";
import QuestionNotifier from "./components/QuestionNotifier";
import { initMouseEffects } from "./utils/mouseEffects";
import LogoStrip from "./components/LogoStrip";
import ToolFinder from "./components/ToolFinder";
import CtaBand from "./components/CtaBand";
import Icon from "./components/Icon";
import Cart from "./components/Cart";
import { categories, allCategories } from "./data/categories";
import { navigate } from "./utils/navigate";
import { whatsappLink } from "./utils/whatsapp";

// Pages other than the home page load only when they are opened, so the first visit stays small and fast
const ProductDetails = lazy(() => import("./components/ProductDetails"));
const ReviewPage = lazy(() => import("./components/ReviewPage"));
const CustomerFAQ = lazy(() => import("./components/CustomerFAQ"));
const Checkout = lazy(() => import("./components/Checkout"));
const CategoryPage = lazy(() => import("./components/CategoryPage"));
const LegalPage = lazy(() => import("./components/LegalPage"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const BlogPage = lazy(() => import("./components/BlogPage"));
const ComparePage = lazy(() => import("./components/ComparePage"));
const InfoPage = lazy(() => import("./components/InfoPage"));

// "/product/gemini-pro" -> ["product", "gemini-pro"], home -> []
const readRoute = () => location.pathname.split("/").filter(Boolean);
// Only the first two featured cards span multiple columns on desktop.
// All remaining cards use one equal grid column, keeping Discounts alongside Marketing, VPN and Entertainment.
const categoryCardClasses = {
  "ai-tools": "lg:col-span-2 lg:row-span-2",
  "creative-tools": "lg:col-span-2",
};
const infoSlugs = Object.keys(infoPages);
const isCatalogRoute = (r) => r[0] === "products" || allCategories.some((c) => c.slug === r[0]);
const legalPages = ["terms", "privacy-policy"];

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12 text-center">
      <h1 className="text-4xl font-extrabold">Page not found</h1>
      <a href="/" className="btn-primary mt-6">Back to home</a>
    </div>
  );
}

function Shop() {
  const [route, setRoute] = useState(readRoute);
  const [category, setCategory] = useState("all");
  const [ratings, setRatings] = useState({});
  const previousRoute = useRef(route);

  useEffect(() => {
    const refresh = () => fetch("/api/ratings", { cache: "no-store" }).then((r) => r.json()).then(setRatings).catch(() => {});
    refresh();
    window.addEventListener("reviews-updated", refresh);
    return () => window.removeEventListener("reviews-updated", refresh);
  }, []);

  useEffect(() => {
    const onRouteChange = () => setRoute((prev) => {
      const next = readRoute();
      return prev.length === next.length && prev.every((part, i) => part === next[i]) ? prev : next;
    });
    // Links that start with "/" switch pages without reloading
    const onClick = (e) => {
      const link = e.target.closest("a[href]");
      const href = link?.getAttribute("href");
      if (!href?.startsWith("/") || href.startsWith("//") || link.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(href);
    };
    window.addEventListener("popstate", onRouteChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onRouteChange);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // New page -> top. Link with #section (like /#faq) -> scroll to that section.
  useEffect(() => {
    const id = location.hash.slice(1);
    // Moving between categories keeps your place on the screen. Any other new page starts at the top.
    const staysInPlace = isCatalogRoute(previousRoute.current) && isCatalogRoute(route);
    previousRoute.current = route;
    if (!id) { if (!staysInPlace) window.scrollTo({ top: 0, behavior: "instant" }); return; }
    const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
    const first = setTimeout(go, 80);
    // if images or lazy parts moved things, line the section up again
    const check = setTimeout(() => { const el = document.getElementById(id); if (el && Math.abs(el.getBoundingClientRect().top - 80) > 40) go(); }, 500);
    return () => { clearTimeout(first); clearTimeout(check); };
  }, [route]);

  // Once the home page is up, quietly fetch the other pages so opening them feels instant
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    const handle = idle(() => {
      // Only prefetch shopping pages; defer less commonly visited pages until requested.
      import("./components/ProductDetails"); import("./components/CategoryPage"); import("./components/Checkout");
    });
    return () => (window.cancelIdleCallback || clearTimeout)(handle);
  }, []);

  // Card glow + tilt, magnetic buttons, hero depth
  useEffect(() => initMouseEffects(), []);

  // Sections fade in as they scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll("main section:not(#home):not(#catalog)").forEach((el) => { el.classList.add("reveal"); observer.observe(el); });
    return () => observer.disconnect();
  }, [route]);

  const showCategory = (slug) => navigate(slug === "all" ? "/#catalog" : `/${slug}`);

  const first = route[0];
  let page;
  if (first === "product" && route[2] === "reviews") page = <ReviewPage key={route[1]} slug={route[1]} />;
  else if (first === "product") page = <ProductDetails key={route[1]} slug={route[1]} />;
  else if (first === "checkout") page = <Checkout />;
  else if (first === "admin") page = <AdminPage />;
  else if (first === "customer-faq") page = <CustomerFAQ />;
  else if (first === "compare") page = <ComparePage key={route[1]} slug={route[1]} />;
  else if (first === "blog") page = <BlogPage key={route[1]} slug={route[1]} />;
  else if (infoSlugs.includes(first)) page = <InfoPage slug={first} />;
  else if (legalPages.includes(first)) page = <LegalPage slug={first} />;
  else if (isCatalogRoute(route)) page = <CategoryPage slug={first === "products" ? "all" : first} ratings={ratings} />;
  else if (first) page = <NotFound />;
  else
    page = (
      <>
        <Hero onSelect={showCategory} />
        <LogoStrip />
        <section id="categories" className="mx-auto max-w-7xl px-5 pt-10 pb-4 sm:pt-12 sm:pb-5">
          <p className="eyebrow">Categories</p>
<h2 className="section-title">Explore Our Tools</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(185px,auto)] lg:grid-cols-4">
            {categories.map((c) => <CategoryCard key={c.slug} category={c} large={c.slug === "ai-tools"} className={categoryCardClasses[c.slug] || ""} />)}
          </div>
        </section>
        <ToolFinder />
        <ProductGrid category={category} setCategory={setCategory} ratings={ratings} />
        <HowItWorks />
        <OrdersChart />
        <WhyChoose />
        <FAQ />
        <Contact />
      </>
    );

  return (
    <>
      <AnnouncementBar />
      <Navbar onSelect={showCategory} />
      <main><Suspense fallback={<div className="grid min-h-[45vh] place-items-center" role="status" aria-live="polite"><span className="text-sm text-slate-400">Opening page…</span></div>}>{page}</Suspense></main>
      {first !== "checkout" && first !== "admin" && <CtaBand />}
      <Footer />
      <Cart />
      <QuestionNotifier />
      <a href={whatsappLink("Hello, I have a question about your products.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className={`wa-fab ${first === "product" ? "max-lg:hidden" : first === "checkout" || first === "admin" ? "hidden" : ""}`}><Icon name="chat" size={20} /><span className="hidden sm:inline">Order on WhatsApp</span></a>
    </>
  );
}

export default function App() {
  return <ProductProvider><DiscountProvider><CartProvider><StockProvider><Shop /></StockProvider></CartProvider></DiscountProvider></ProductProvider>;
}
