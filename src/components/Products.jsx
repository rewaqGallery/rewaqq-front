import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import FilterSidebar from "./FilterSideBar";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import { getProducts } from "../services/productService";

import "./style/product.css";

function Products({ limit = 20, featured = false, showFilters = true }) {
  const [searchParams] = useSearchParams();

  const keywordFromURL = searchParams.get("keyword") || "";
  const categoryFromURL = searchParams.get("category") || "";

  const [filters, setFilters] = useState({
    categories: categoryFromURL ? [categoryFromURL] : [],
    maxPrice: 0,
    availableOnly: false,
    keyword: keywordFromURL,
    page: 1,
    limit: limit || 10,
  });

  const [products, setProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //! Sync URL params with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      keyword: keywordFromURL,
      categories: categoryFromURL ? [categoryFromURL] : [],
      page: 1,
    }));
  }, [keywordFromURL, categoryFromURL]);

  //! Load products
  useEffect(() => {
    setLoading(true);
    setError(null);

    getProducts(filters)
      .then((res) => {
        setProducts(res.data);
        setTotalResults(res.totalResults);
      })
      .catch((err) => {
        setError(err.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  if (loading && products.length === 0) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main className="products-page">
      {showFilters && !featured && (
        <section className="filter-horizontal">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </section>
      )}

      <section className="products-content">
        {!featured && (
          <header className="results-count">
            <p>
              Showing {products.length} of {totalResults} products
            </p>
          </header>
        )}

        <ul className="products-grid" aria-live="polite">
          {products.length ? (
            products.map((product) => {
              if (featured && !product.featured) return null;
              return (
                <li key={product._id}>
                  <ProductCard product={product} />
                </li>
              );
            })
          ) : (
            <li className="no-products">
              <p>No products match your filters</p>
            </li>
          )}
        </ul>

        {!featured && (
          <Pagination
            page={filters.page}
            setPage={(newPage) =>
              setFilters((prev) => ({ ...prev, page: newPage }))
            }
            totalResults={totalResults}
            limit={filters.limit}
          />
        )}
      </section>
    </main>
  );
}

export default Products;
