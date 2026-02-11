import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin"; 
import Shop from "./pages/Shop";
import { ShoppingBag, ShieldCheck, Search, Mail, Phone, Menu, X, ChevronDown } from "lucide-react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export const formatGHS = (amount) =>
  `GH₵${parseFloat(amount || 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`;

const subcategoryMap = {
  "Beauty & Personal Care": ["Wigs & Hair Extensions", "Skincare", "Haircare", "Makeup", "Personal Hygiene"],
  "Fashion & Apparel": ["Men's Clothing", "Women's Clothing", "Footwear", "Fashion Accessories"],
  Electronics: ["Mobile Phones", "Computers", "Audio", "Smart Gadgets"],
  "Mobile Accessories": ["Phone Cases", "Chargers", "Screen Protectors", "Power Banks", "Earphones & Headphones", "Smartwatches", "Phone Holders/Stands"],
  "Home & Living": ["Home Essentials", "Kitchen & Dining", "Home Utilities", "Home Appliances"],
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [adminProfilePic, setAdminProfilePic] = useState(() => localStorage.getItem("nextrend_admin_pic") || null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [category, setCategory] = useState("All");
  const [subcategory, setSubcategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCat, setExpandedCat] = useState(null);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    localStorage.setItem("nextrend_admin_pic", adminProfilePic || "");
    return () => { unsubProducts(); unsubOrders(); };
  }, [adminProfilePic]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const categories = [
    { name: "All", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200" },
    { name: "Beauty & Personal Care", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200" },
    { name: "Fashion & Apparel", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200" },
    { name: "Electronics", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200" },
    { name: "Mobile Accessories", img: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=200" },
    { name: "Home & Living", img: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=200" },
  ];

  const handleCategoryChange = (catName) => {
    setCategory(catName); setSubcategory("All"); setIsMenuOpen(false);
  };

  return (
    <Router>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600;800;900&display=swap');
        body { font-family: 'Montserrat', sans-serif; margin: 0; background: #fff; overflow-x: hidden; }
        
        .nav-container {
            display: flex;
            flex-direction: column;
            background: #fff;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .action-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 20px;
            width: 100%;
            box-sizing: border-box;
        }

        .search-row {
            padding: 5px 20px 15px;
            width: 100%;
            box-sizing: border-box;
        }

        @media (min-width: 769px) {
            .action-bar {
                padding: 15px 40px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
            }
            .search-row {
                grid-column: 2;
                grid-row: 1;
                padding: 0;
                display: flex;
                justify-content: center;
            }
            .nav-container { flex-direction: row; flex-wrap: wrap; }
            .logo-pc { justify-content: center !important; }
            .icons-pc { justify-content: flex-end !important; }
        }

        .cat-scroll {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            padding: 10px 20px;
            scrollbar-width: none;
            border-top: 1px solid #f0f0f0;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* SIDEBAR MENU */}
      {isMenuOpen && (
        <div style={menuOverlay} onClick={() => setIsMenuOpen(false)}>
          <div style={menuDrawer} onClick={e => e.stopPropagation()}>
            <div style={menuHeader}>
              <h2 style={{ fontFamily: "Playfair Display", margin: 0 }}>COLLECTIONS</h2>
              <X onClick={() => setIsMenuOpen(false)} style={{ cursor: "pointer" }} size={30} />
            </div>
            <div style={menuContent}>
              {categories.map((cat) => (
                <div key={cat.name}>
                  <div onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)} style={menuItem}>
                    <span onClick={(e) => { e.stopPropagation(); handleCategoryChange(cat.name); }}>{cat.name.toUpperCase()}</span>
                    {subcategoryMap[cat.name] && <ChevronDown size={18} style={{transform: expandedCat === cat.name ? 'rotate(180deg)' : 'none', transition: '0.3s'}} />}
                  </div>
                  {expandedCat === cat.name && subcategoryMap[cat.name] && (
                    <div style={subMenuBox}>
                      <p onClick={() => handleCategoryChange(cat.name)} style={subMenuItem}>ALL {cat.name.toUpperCase()}</p>
                      {subcategoryMap[cat.name].map((sub) => (
                        <p key={sub} onClick={() => { setSubcategory(sub); setCategory(cat.name); setIsMenuOpen(false); }} style={subMenuItem}>{sub.toUpperCase()}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LUXURY HERO HEADER */}
      <header style={luxuryHeader}>
        <div style={overlay}>
          <h1 style={logoStyle}>NEX<span style={{ color: "#D4AF37" }}>TREND</span></h1>
          <p style={tagline}>YOUR WISH IS OUR COMMAND</p>
          <p style={subTagline}>HOME OF UNIQUE LUXURY</p>
        </div>
      </header>

      {/* STICKY NAVIGATION SYSTEM */}
      <div className="nav-container">
        <div className="action-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Menu onClick={() => setIsMenuOpen(true)} style={{ cursor: "pointer" }} size={28} />
            <h2 className="hide-on-mobile" style={{ fontFamily: "Playfair Display", fontSize: '18px', margin: 0, display: window.innerWidth < 768 ? 'none' : 'block' }}>NEX<span style={{ color: "#D4AF37" }}>TREND</span></h2>
          </div>

          <div className="logo-pc" style={{ display: 'flex', justifyContent: 'center' }}>
             <Link to="/" style={{textDecoration:'none', color:'#000'}}>
                <h2 style={{ fontFamily: "Playfair Display", fontSize: '22px', margin: 0 }}>NEX<span style={{ color: "#D4AF37" }}>TREND</span></h2>
             </Link>
          </div>

          <div className="icons-pc" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div onClick={() => setShowCart(true)} style={iconWrap}>
              <ShoppingBag size={26} />
              {cart.length > 0 && <span style={badgeStyle}>{cart.length}</span>}
            </div>
            <Link to="/admin" style={iconWrap}><ShieldCheck size={26} color={isAdmin ? "#D4AF37" : "#000"} /></Link>
          </div>
        </div>

        <div className="search-row">
            <div style={searchWrapper}>
                <Search size={18} color="#D4AF37" />
                <input type="text" placeholder="Search the collection..." style={longSearchField} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>

        <div className="cat-scroll">
          {categories.map((cat) => (
            <button key={cat.name} onClick={() => handleCategoryChange(cat.name)} style={catBubble}>
              <div style={{ ...catImgWrapper, borderColor: category === cat.name ? "#D4AF37" : "#eee" }}>
                <img src={cat.img} alt={cat.name} style={catImgStyle} />
              </div>
              <span style={{ ...catLabel, color: category === cat.name ? "#D4AF37" : "#000" }}>{cat.name.split(' ')[0].toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Shop products={products} cart={cart} setCart={setCart} category={category} subcategory={subcategory} setSubcategory={setSubcategory} showCart={showCart} setShowCart={setShowCart} cartTotal={cartTotal} searchQuery={searchQuery} setOrders={setOrders} subcategoryMap={subcategoryMap} />} />
        <Route path="/admin" element={<Admin products={products} setProducts={setProducts} isAdmin={isAdmin} setIsAdmin={setIsAdmin} orders={orders} setOrders={setOrders} adminProfilePic={adminProfilePic} setAdminProfilePic={setAdminProfilePic} />} />
      </Routes>

      <footer style={luxuryFooter}>
        <h2 style={{ fontFamily: "Playfair Display", letterSpacing: "6px", fontSize: "32px" }}>NEX<span style={{ color: "#D4AF37" }}>TREND</span></h2>
        <p style={footerTag}>YOUR WISH IS OUR COMMAND</p>
        <p style={{ fontSize: "10px", letterSpacing: "2px", opacity: 0.8, color: "#D4AF37", marginBottom: "20px" }}>HOME OF UNIQUE LUXURY</p>
        <div style={contactBox}>
          <div style={contactItem}><Mail size={18} color="#D4AF37" /><a href="mailto:Asirifigraceantwiwaa@gmail.com" style={{ color: "#fff", textDecoration: "none" }}>Asirifigraceantwiwaa@gmail.com</a></div>
          <div style={contactItem}><Phone size={18} color="#D4AF37" /><span>Manager: +233 50 400 3676</span></div>
        </div>
        <div style={devSection}><p style={devText}>© 2026 | ENGINEERED BY <span style={devName}>RICHARD KWESI WALIBA</span></p></div>
      </footer>
    </Router>
  );
}

// STYLES 
const luxuryHeader = { height: "180px", backgroundImage: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070")', backgroundSize: "cover", backgroundPosition: "center", position: "relative" };
const overlay = { position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", textAlign: 'center' };
const logoStyle = { fontFamily: "Playfair Display", fontSize: "36px", margin: 0, letterSpacing: "6px" };
const tagline = { color: "#D4AF37", fontSize: "10px", letterSpacing: "3px", fontWeight: "900", margin: "8px 0 0" };
const subTagline = { fontSize: "9px", letterSpacing: "2px", opacity: 0.8 };

const searchWrapper = { display: "flex", alignItems: "center", background: "#f5f5f5", padding: "10px 15px", borderRadius: "50px", width: "100%", maxWidth: "600px" };
const longSearchField = { background: "none", border: "none", marginLeft: "10px", width: "100%", outline: "none", fontWeight: "600", fontSize: '14px' };

const catBubble = { background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", minWidth: '80px' };
const catImgWrapper = { width: "50px", height: "50px", borderRadius: "50%", padding: "2px", border: "2px solid", overflow: "hidden", transition: '0.3s' };
const catImgStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" };
const catLabel = { fontSize: "9px", fontWeight: "800", textAlign: "center", letterSpacing: '0.5px' };

const iconWrap = { position: "relative", cursor: "pointer" };
const badgeStyle = { position: "absolute", top: "-8px", right: "-8px", background: "#D4AF37", color: "#000", borderRadius: "50%", padding: "2px 6px", fontSize: "10px", fontWeight: "900" };

const menuOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 5000, display: "flex" };
const menuDrawer = { width: "300px", background: "#fff", height: "100%", padding: "30px 20px", overflowY: "auto", boxShadow: '10px 0 30px rgba(0,0,0,0.2)' };
const menuHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #eee", paddingBottom: "15px" };
const menuContent = { display: "flex", flexDirection: "column" };
const menuItem = { display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #f9f9f9", fontWeight: "800", fontSize: "13px", cursor: "pointer" };
const subMenuBox = { background: "#fcfcfc", paddingLeft: "15px", borderLeft: "2px solid #D4AF37", marginBottom: "10px" };
const subMenuItem = { fontSize: "11px", fontWeight: "600", padding: "10px 0", cursor: "pointer", color: "#666" };

const luxuryFooter = { background: "#000", color: "#fff", padding: "50px 20px", textAlign: "center" };
const footerTag = { fontSize: "11px", letterSpacing: "2px", margin: "10px 0", color: "#D4AF37" };
const contactBox = { display: "flex", flexDirection: "column", gap: "12px", marginTop: "25px", alignItems: "center" };
const contactItem = { display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" };
const devSection = { marginTop: "40px", borderTop: "1px solid #222", paddingTop: "25px" };
const devText = { fontSize: "10px", letterSpacing: "1px", color: "#555" };
const devName = { color: "#D4AF37", fontWeight: "900" };