import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  ShoppingBag,
  ShieldCheck,
  Search,
  Mail,
  Phone,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

// 1. IMPORT YOUR NEW FIREBASE SETTINGS
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

import Shop from "./pages/Shop";
import Admin from "./pages/Admin";

export const formatGHS = (amount) =>
  `GH₵${parseFloat(amount || 0).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
  })}`;

const subcategoryMap = {
  "Beauty & Personal Care": [
    "Wigs & Hair Extensions",
    "Skincare",
    "Haircare",
    "Makeup",
    "Personal Hygiene",
  ],
  "Fashion & Apparel": [
    "Men's Clothing",
    "Women's Clothing",
    "Footwear",
    "Fashion Accessories",
  ],
  Electronics: ["Mobile Phones", "Computers", "Audio", "Smart Gadgets"],
  "Mobile Accessories": [
    "Phone Cases",
    "Chargers",
    "Screen Protectors",
    "Power Banks",
    "Earphones & Headphones",
    "Smartwatches",
    "Phone Holders/Stands",
  ],
  "Home & Living": [
    "Home Essentials",
    "Kitchen & Dining",
    "Home Utilities",
    "Home Appliances",
  ],
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [adminProfilePic, setAdminProfilePic] = useState(
    () => localStorage.getItem("nextrend_admin_pic") || null,
  );
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); // This holds your Pending Orders
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  // 2. REAL-TIME CLOUD LISTENERS
  useEffect(() => {
    // Listen for Products
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    });

    // Listen for Orders (Pending Requests)
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderItems);
    });

    localStorage.setItem("nextrend_admin_pic", adminProfilePic || "");

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [adminProfilePic]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const categories = [
    {
      name: "All",
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200",
    },
    {
      name: "Beauty & Personal Care",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200",
    },
    {
      name: "Fashion & Apparel",
      img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200",
    },
    {
      name: "Electronics",
      img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200",
    },
    {
      name: "Mobile Accessories",
      img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=200",
    },
    {
      name: "Home & Living",
      img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=200",
    },
  ];

  const handleCategoryChange = (catName) => {
    setCategory(catName);
    setSubcategory("All");
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;800;900&display=swap');
        body { font-family: 'Montserrat', sans-serif; margin: 0; background: #fff; }
      `}</style>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div style={menuOverlay}>
          <div style={menuDrawer}>
            <div style={menuHeader}>
              <h2 style={{ fontFamily: "Playfair Display" }}>COLLECTIONS</h2>
              <X
                onClick={() => setIsMenuOpen(false)}
                style={{ cursor: "pointer" }}
                size={30}
              />
            </div>
            <div style={menuContent}>
              {categories.map((cat) => (
                <div key={cat.name}>
                  <div
                    onClick={() =>
                      setExpandedCat(expandedCat === cat.name ? null : cat.name)
                    }
                    style={menuItem}
                  >
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCategoryChange(cat.name);
                      }}
                    >
                      {cat.name.toUpperCase()}
                    </span>
                    {subcategoryMap[cat.name] && <ChevronDown size={18} />}
                  </div>
                  {expandedCat === cat.name && subcategoryMap[cat.name] && (
                    <div style={subMenuBox}>
                      <p
                        onClick={() => handleCategoryChange(cat.name)}
                        style={subMenuItem}
                      >
                        ALL {cat.name.toUpperCase()}
                      </p>
                      {subcategoryMap[cat.name].map((sub) => (
                        <p
                          key={sub}
                          onClick={() => {
                            setSubcategory(sub);
                            setCategory(cat.name);
                            setIsMenuOpen(false);
                          }}
                          style={subMenuItem}
                        >
                          {sub.toUpperCase()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={luxuryHeader}>
        <div style={overlay}>
          <h1 style={logoStyle}>
            NEX<span style={{ color: "#D4AF37" }}>TREND</span>
          </h1>
          <p style={tagline}>YOUR WISH IS OUR COMMAND</p>
          <p style={subTagline}>HOME OF UNIQUE LUXURY</p>
        </div>
      </header>

      {/* NAVIGATION */}
      <nav style={stickyNav}>
        <Menu
          onClick={() => setIsMenuOpen(true)}
          style={{ cursor: "pointer", marginRight: "20px" }}
          size={28}
        />
        <div style={navContainer}>
          <div style={searchWrapper}>
            <Search size={20} color="#D4AF37" />
            <input
              type="text"
              placeholder="Search the collection..."
              style={longSearchField}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={catCenter}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                style={catBubble}
              >
                <div
                  style={{
                    ...catImgWrapper,
                    borderColor:
                      category === cat.name ? "#D4AF37" : "transparent",
                  }}
                >
                  <img src={cat.img} alt={cat.name} style={catImgStyle} />
                </div>
                <span
                  style={{
                    ...catLabel,
                    color: category === cat.name ? "#D4AF37" : "#000",
                  }}
                >
                  {cat.name.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={navIcons}>
          <div onClick={() => setShowCart(true)} style={iconWrap}>
            <ShoppingBag size={28} />
            {cart.length > 0 && <span style={badgeStyle}>{cart.length}</span>}
          </div>
          <Link to="/admin" style={iconWrap}>
            <ShieldCheck size={28} color={isAdmin ? "#D4AF37" : "#000"} />
          </Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <Shop
              products={products}
              cart={cart}
              setCart={setCart}
              category={category}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              showCart={showCart}
              setShowCart={setShowCart}
              cartTotal={cartTotal}
              searchQuery={searchQuery}
              setOrders={setOrders}
              subcategoryMap={subcategoryMap}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <Admin
              products={products}
              setProducts={setProducts}
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              orders={orders}
              setOrders={setOrders}
              adminProfilePic={adminProfilePic}
              setAdminProfilePic={setAdminProfilePic}
            />
          }
        />
      </Routes>

      <footer style={luxuryFooter}>
        <h2
          style={{
            fontFamily: "Playfair Display",
            letterSpacing: "6px",
            fontSize: "32px",
          }}
        >
          NEX<span style={{ color: "#D4AF37" }}>TREND</span>
        </h2>
        <p style={footerTag}>YOUR WISH IS OUR COMMAND</p>
        <p style={footerSubTagline}>HOME OF UNIQUE LUXURY</p>
        <div style={contactBox}>
          <div style={contactItem}>
            <Mail size={18} color="#D4AF37" />
            <a
              href="mailto:Asirifigraceantwiwaa@gmail.com"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Asirifigraceantwiwaa@gmail.com
            </a>
          </div>
          <div style={contactItem}>
            <Phone size={18} color="#D4AF37" />
            <span>Manager: +233 50 400 3676</span>
          </div>
        </div>
        <div style={devSection}>
          <p style={devText}>
            © 2026 | ENGINEERED BY <span style={devName}>BRAINY SYSTEMS</span>
          </p>
        </div>
      </footer>
    </Router>
  );
}

// STYLES (Keep exactly as they were in your code)
const luxuryHeader = {
  height: "260px",
  backgroundImage:
    'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070")',
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};
const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
};
const logoStyle = {
  fontFamily: "Playfair Display",
  fontSize: "45px",
  margin: 0,
  letterSpacing: "8px",
};
const tagline = {
  color: "#D4AF37",
  fontSize: "11px",
  letterSpacing: "4px",
  fontWeight: "900",
  margin: "8px 0 0",
};
const subTagline = { fontSize: "10px", letterSpacing: "2px", opacity: 0.8 };
const stickyNav = {
  padding: "15px 30px",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
};
const navContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
  gap: "10px",
};
const searchWrapper = {
  display: "flex",
  alignItems: "center",
  background: "#f5f5f5",
  padding: "8px 20px",
  borderRadius: "50px",
  width: "65%",
};
const longSearchField = {
  background: "none",
  border: "none",
  marginLeft: "10px",
  width: "100%",
  outline: "none",
  fontWeight: "600",
};
const catCenter = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  justifyContent: "center",
};
const catBubble = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
};
const catImgWrapper = {
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  padding: "2px",
  border: "2px solid transparent",
  overflow: "hidden",
};
const catImgStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};
const catLabel = {
  fontSize: "8px",
  fontWeight: "900",
  textAlign: "center",
  maxWidth: "60px",
};
const navIcons = { display: "flex", gap: "20px", alignItems: "center" };
const iconWrap = { position: "relative", cursor: "pointer" };
const badgeStyle = {
  position: "absolute",
  top: "-8px",
  right: "-8px",
  background: "#D4AF37",
  color: "#000",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: "10px",
  fontWeight: "900",
};
const menuOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  zIndex: 5000,
  display: "flex",
};
const menuDrawer = {
  width: "280px",
  background: "#fff",
  height: "100%",
  padding: "30px 20px",
  overflowY: "auto",
};
const menuHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  borderBottom: "1px solid #eee",
  paddingBottom: "15px",
};
const menuContent = { display: "flex", flexDirection: "column" };
const menuItem = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #f9f9f9",
  fontWeight: "900",
  fontSize: "12px",
  cursor: "pointer",
};
const subMenuBox = { background: "#f9f9f9", padding: "10px" };
const subMenuItem = {
  fontSize: "10px",
  fontWeight: "700",
  padding: "8px 0",
  cursor: "pointer",
  color: "#555",
};
const luxuryFooter = {
  background: "#000",
  color: "#fff",
  padding: "50px 20px",
  textAlign: "center",
};
const footerTag = { fontSize: "13px", letterSpacing: "2px", margin: "5px 0" };
const footerSubTagline = {
  fontSize: "11px",
  letterSpacing: "3px",
  color: "#D4AF37",
  marginTop: "5px",
  fontWeight: "600",
};
const contactBox = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "20px",
  alignItems: "center",
};
const contactItem = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "14px",
};
const devSection = {
  marginTop: "30px",
  borderTop: "1px solid #222",
  paddingTop: "20px",
};
const devText = { fontSize: "10px", letterSpacing: "1px", color: "#666" };
const devName = { color: "#D4AF37", fontWeight: "900" };
