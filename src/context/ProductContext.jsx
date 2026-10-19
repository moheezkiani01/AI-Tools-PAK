import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as baseProducts } from "../data/products";
import { applyProductDetails } from "../utils/productDetails";

const ProductContext = createContext({ products: baseProducts, ready: false });
export const useProducts = () => useContext(ProductContext).products;

export function ProductProvider({ children }) {
  const [details, setDetails] = useState({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/product-details", { cache: "no-store" });
        if (!response.ok) throw new Error("Product details unavailable");
        const data = await response.json();
        if (active) {
          setDetails((previous) => JSON.stringify(previous) === JSON.stringify(data.details || {}) ? previous : data.details || {});
          setReady(true);
        }
      } catch { if (active) setReady(false); }
    };
    refresh();
    const timer = setInterval(refresh, 60000);
    const changed = () => refresh();
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("product-details-updated", changed);
    document.addEventListener("visibilitychange", visible);
    return () => { active = false; clearInterval(timer); window.removeEventListener("product-details-updated", changed); document.removeEventListener("visibilitychange", visible); };
  }, []);
  const products = useMemo(() => baseProducts.map((p) => applyProductDetails(p, details[p.slug])), [details]);
  return <ProductContext.Provider value={{ products, ready }}>{children}</ProductContext.Provider>;
}
