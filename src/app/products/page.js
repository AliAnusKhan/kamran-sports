import Link from "next/link";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>
        All Products
      </h1>

      {products.length === 0 ? (
        <p>No products found or MongoDB is connecting...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                backgroundColor: "#fff",
              }}
            >
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title || product.name}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              )}
              <h3 style={{ fontSize: "18px", margin: "12px 0 6px" }}>
                {product.title || product.name}
              </h3>
              <p style={{ fontWeight: "bold", color: "#16a34a", fontSize: "16px" }}>
                Rs. {product.price}
              </p>
              <Link
                href={`/products/${product._id}`}
                style={{
                  display: "inline-block",
                  marginTop: "12px",
                  padding: "8px 16px",
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "4px",
                  textDecoration: "none",
                }}
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}