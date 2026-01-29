import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import {
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  LogOut,
  ShieldCheck,
  Eye,
  ImageIcon,
  Camera,
  FileText,
  Search,
  MessageCircle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatGHS } from "../App";

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

const Admin = ({
  products = [],
  setProducts = () => {},
  isAdmin,
  setIsAdmin,
  orders = [],
  setOrders = () => {},
  adminProfilePic,
  setAdminProfilePic,
}) => {
  const [pass, setPass] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [localOrders, setLocalOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    desc: "",
    colors: "",
    sizes: "",
    category: "Beauty & Personal Care",
    subcategory: "",
    img: "",
    inStock: true,
  });
  const [imgFile, setImgFile] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, "orders"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocalOrders(ordersData);
        if (typeof setOrders === "function") setOrders(ordersData);
      });
      return () => unsubscribe();
    }
  }, [isAdmin, setOrders]);

  const handleAuth = () => {
    if (pass === "Obiade31472") setIsAdmin(true);
    else alert("Access Denied: Incorrect Key");
  };

  const uploadToImgBB = async (file) => {
    const apiKey = "A23ac6c9c1bcb7ae44471fe3f304cc9b";
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const data = await response.json();
    if (data.success) return data.data.url;
    throw new Error("ImgBB Upload Failed");
  };

  const saveProduct = async () => {
    if (!form.name || !form.img) return alert("Name and Image are required.");
    setIsUploading(true);
    try {
      let finalImgUrl = form.img;
      if (imgFile) {
        finalImgUrl = await uploadToImgBB(imgFile);
      }
      const productData = { ...form, img: finalImgUrl };
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      setForm({
        name: "",
        price: "",
        desc: "",
        colors: "",
        sizes: "",
        category: "Beauty & Personal Care",
        subcategory: "",
        img: "",
        inStock: true,
      });
      setImgFile(null);
      alert("Item Published Successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStockStatus = async (product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        inStock: !product.inStock,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const quickAdd = (field, value) => {
    const current = form[field];
    const newValue = current ? `${current}, ${value}` : value;
    setForm({ ...form, [field]: newValue });
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete item?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const displayOrders = localOrders.length > 0 ? localOrders : orders;
  const totalRevenue = displayOrders.reduce(
    (sum, order) => sum + (Number(order.total) || 0),
    0,
  );

  const chatWithCustomer = (order) => {
    const cleanPhone = order.phone.replace(/\s/g, "").replace("+", "");
    const msg = `Hello ${order.name}, this is Nextrend. We have received your order!`;
    window.open(
      `https://wa.me/${cleanPhone.startsWith("233") ? cleanPhone : "233" + cleanPhone}?text=${encodeURIComponent(msg)}`,
    );
  };

  if (!isAdmin)
    return (
      <div style={adminOuter}>
        <div style={loginOverlay}>
          <div style={smallLoginCard}>
            <div style={profileCircle}>
              {adminProfilePic ? (
                <img
                  src={adminProfilePic}
                  alt="Admin"
                  style={profileImgStyle}
                />
              ) : (
                <ShieldCheck size={40} color="#D4AF37" />
              )}
              <label style={editPicIcon}>
                <Camera size={14} color="#fff" />
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    const r = new FileReader();
                    r.onload = () => setAdminProfilePic(r.result);
                    r.readAsDataURL(e.target.files[0]);
                  }}
                />
              </label>
            </div>
            <h3
              style={{
                fontFamily: "Playfair Display",
                color: "#D4AF37",
                marginBottom: "5px",
              }}
            >
              STAFF PORTAL
            </h3>
            <input
              type="password"
              placeholder="ENTER ACCESS KEY"
              onChange={(e) => setPass(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              style={smallIn}
            />
            <button onClick={handleAuth} style={smallBtn}>
              LOGIN
            </button>
            <Link to="/" style={backToShopLink}>
              ← BACK TO SHOP
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ padding: "80px 50px", maxWidth: "1600px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "30px",
          alignItems: "center",
        }}
      >
        <Link to="/" style={boldBack}>
          ← STOREFRONT
        </Link>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={miniStat}>
            <TrendingUp size={14} color="#D4AF37" />{" "}
            <strong>REVENUE: {formatGHS(totalRevenue)}</strong>
          </div>
          <button onClick={() => setIsAdmin(false)} style={logoutBtn}>
            <LogOut size={20} /> LOGOUT
          </button>
        </div>
      </div>

      <div style={adminSplit}>
        {/* FORM PANEL - 40% Width */}
        <div style={controlPanel}>
          <h3 style={sectionLabel}>
            {editingId ? "UPDATE STOCK" : "ADD NEW STOCK"}
          </h3>
          <input
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={admIn}
          />
          <input
            placeholder="Price (GHS)"
            value={form.price}
            type="number"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            style={admIn}
          />
          <textarea
            placeholder="Description"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            style={{ ...admIn, height: "80px", resize: "none" }}
          />

          <div style={{ marginBottom: "15px" }}>
            <p style={miniLabel}>QUICK COLORS</p>
            <div style={quickPickRow}>
              {["Black", "White", "Red", "Gold", "Nude", "Blue"].map((c) => (
                <span
                  key={c}
                  onClick={() => quickAdd("colors", c)}
                  style={tagBtn}
                >
                  {c}
                </span>
              ))}
            </div>
            <input
              placeholder="Colors"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              style={{ ...admIn, marginTop: "5px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <p style={miniLabel}>QUICK SIZES</p>
            <div style={quickPickRow}>
              {["S", "M", "L", "XL", "38", "40", "42", "44"].map((s) => (
                <span
                  key={s}
                  onClick={() => quickAdd("sizes", s)}
                  style={tagBtn}
                >
                  {s}
                </span>
              ))}
            </div>
            <input
              placeholder="Sizes"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              style={{ ...admIn, marginTop: "5px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value, subcategory: "" })
              }
              style={admIn}
            >
              {Object.keys(subcategoryMap).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.subcategory || ""}
              onChange={(e) =>
                setForm({ ...form, subcategory: e.target.value })
              }
              style={admIn}
              disabled={!form.category}
            >
              <option value="">Subcategory</option>
              {form.category &&
                subcategoryMap[form.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImgFile(file);
                const r = new FileReader();
                r.onload = () => setForm({ ...form, img: r.result });
                r.readAsDataURL(file);
              }
            }}
            style={{ marginBottom: "20px" }}
          />
          <button onClick={saveProduct} style={admBtn} disabled={isUploading}>
            {isUploading
              ? "UPLOADING..."
              : editingId
                ? "SAVE CHANGES"
                : "PUBLISH ITEM"}
          </button>
        </div>

        {/* BIGGER PREVIEW PANEL - 60% Width */}
        <div style={previewPanel}>
          <h3 style={sectionLabel}>
            <Eye size={16} /> LIVE PREVIEW (BIGGER VIEW)
          </h3>
          <div style={previewInnerBoxStyle}>
            <div style={previewContent}>
              <div style={prevImgWrap}>
                {form.img ? (
                  <img src={form.img} alt="Preview" style={prevImg} />
                ) : (
                  <div style={prevPlaceholder}>
                    <Package size={80} color="#ddd" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1.2 }}>
                <h2 style={prevTitle}>{form.name || "PRODUCT NAME"}</h2>
                <p style={prevPrice}>{formatGHS(form.price || 0)}</p>

                <div style={prevBadgeRow}>
                  <span style={catBadge}>{form.category}</span>
                  {form.subcategory && (
                    <span style={subBadge}>{form.subcategory}</span>
                  )}
                </div>

                <p style={prevDesc}>
                  {form.desc ||
                    "Provide a product description to see it appear here in real-time..."}
                </p>

                {form.sizes && (
                  <div style={{ marginTop: "25px" }}>
                    <p style={miniLabel}>AVAILABLE SIZES</p>
                    <div style={prevTagRow}>
                      {form.sizes.split(",").map((s) => (
                        <span key={s} style={sizeBox}>
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {form.colors && (
                  <div style={{ marginTop: "25px" }}>
                    <p style={miniLabel}>AVAILABLE COLORS</p>
                    <div style={prevTagRow}>
                      {form.colors.split(",").map((c) => (
                        <span key={c} style={colorBox}>
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "80px" }}>
        <h3 style={sectionLabel}>
          <FileText size={18} /> INCOMING REQUESTS ({displayOrders.length})
        </h3>
        {displayOrders.map((order) => (
          <div key={order.id} style={invRow}>
            <div style={{ flex: 1 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <p style={{ margin: 0, fontWeight: "900", fontSize: "18px" }}>
                  {order.name?.toUpperCase()}
                </p>
                <span
                  style={{
                    background: "#FFF4E5",
                    color: "#B7791F",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: "900",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Clock size={10} /> PENDING
                </span>
              </div>
              <p
                style={{
                  margin: "5px 0",
                  fontSize: "14px",
                  color: "#D4AF37",
                  fontWeight: "bold",
                }}
              >
                {order.phone} | {order.region}
              </p>
              <div
                style={{
                  background: "#f9f9f9",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #eee",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                  }}
                >
                  {order.items}
                </pre>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {order.receiptUrl && (
                  <button
                    onClick={() => window.open(order.receiptUrl, "_blank")}
                    style={viewReceiptBtn}
                  >
                    <ImageIcon size={14} /> VIEW PHOTO
                  </button>
                )}
                <button
                  onClick={() => chatWithCustomer(order)}
                  style={whatsappBtn}
                >
                  <MessageCircle size={14} /> WHATSAPP
                </button>
              </div>
            </div>
            <Trash2
              size={24}
              color="red"
              style={{ cursor: "pointer", marginLeft: "20px" }}
              onClick={async () => {
                if (window.confirm("Delete order?"))
                  await deleteDoc(doc(db, "orders", order.id));
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "80px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #000",
            paddingBottom: "10px",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{ ...sectionLabel, borderBottom: "none", marginBottom: 0 }}
          >
            INVENTORY
          </h3>
          <div style={searchBarContainer}>
            <Search size={16} color="#888" />
            <input
              placeholder="Search..."
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchField}
            />
          </div>
        </div>
        {products
          .filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((p) => (
            <div key={p.id} style={invRow}>
              <img
                src={p.img}
                alt=""
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
              <div style={{ flex: 1, marginLeft: "20px" }}>
                <p style={{ fontWeight: "900", margin: 0 }}>{p.name}</p>
                <p style={{ color: "#D4AF37", fontWeight: "bold", margin: 0 }}>
                  {formatGHS(p.price)}
                </p>
              </div>
              <div
                style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
                <div
                  onClick={() => toggleStockStatus(p)}
                  style={{ cursor: "pointer", textAlign: "center" }}
                >
                  {p.inStock ? (
                    <CheckCircle color="green" size={20} />
                  ) : (
                    <XCircle color="red" size={20} />
                  )}
                </div>
                <Edit3
                  onClick={() => {
                    setEditingId(p.id);
                    setForm(p);
                    window.scrollTo(0, 0);
                  }}
                  color="#D4AF37"
                  size={20}
                  style={{ cursor: "pointer" }}
                />
                <Trash2
                  onClick={() => deleteProduct(p.id)}
                  color="red"
                  size={20}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// --- UPDATED STYLES FOR BIGGER PREVIEW ---
const adminSplit = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1.8fr",
  gap: "40px",
  alignItems: "start",
}; // 40/60 split
const previewInnerBoxStyle = {
  background: "#fff",
  padding: "40px",
  border: "1px solid #eee",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
};
const prevImgWrap = {
  flex: 1,
  minWidth: "300px",
  height: "400px",
  borderRadius: "12px",
  overflow: "hidden",
  border: "1px solid #f0f0f0",
};
const prevTitle = {
  fontFamily: "Playfair Display",
  fontSize: "28px",
  margin: "0 0 10px 0",
  fontWeight: "900",
  color: "#000",
};
const prevPrice = {
  color: "#D4AF37",
  fontWeight: "900",
  fontSize: "24px",
  marginBottom: "15px",
};
const prevDesc = {
  fontSize: "14px",
  color: "#555",
  lineHeight: "1.6",
  marginTop: "15px",
  borderTop: "1px dashed #eee",
  paddingTop: "15px",
};
const sizeBox = {
  border: "1px solid #000",
  padding: "6px 15px",
  fontSize: "12px",
  fontWeight: "bold",
};
const colorBox = {
  background: "#f9f9f9",
  border: "1px solid #ddd",
  padding: "6px 15px",
  fontSize: "12px",
  fontWeight: "bold",
};

// --- STYLES (Keep existing) ---
const quickPickRow = {
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
  marginBottom: "10px",
};
const tagBtn = {
  background: "#f0f0f0",
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  border: "1px solid #ddd",
};
const previewContent = { display: "flex", gap: "40px", flexWrap: "wrap" };
const prevBadgeRow = { display: "flex", gap: "8px", margin: "15px 0" };
const catBadge = {
  background: "#000",
  color: "#D4AF37",
  fontSize: "10px",
  padding: "4px 12px",
  borderRadius: "50px",
  fontWeight: "bold",
};
const subBadge = {
  background: "#D4AF37",
  color: "#000",
  fontSize: "10px",
  padding: "4px 12px",
  borderRadius: "50px",
  fontWeight: "bold",
};
const prevTagRow = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginTop: "10px",
};
const miniLabel = {
  fontSize: "10px",
  fontWeight: "900",
  color: "#888",
  letterSpacing: "1px",
  marginBottom: "8px",
  display: "block",
};
const miniStat = {
  background: "#f9f9f9",
  padding: "8px 15px",
  borderRadius: "50px",
  fontSize: "12px",
  border: "1px solid #eee",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};
const whatsappBtn = {
  background: "#25D366",
  color: "#fff",
  padding: "8px 15px",
  cursor: "pointer",
  border: "none",
  fontWeight: "900",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  borderRadius: "5px",
  fontSize: "11px",
};
const searchBarContainer = {
  display: "flex",
  alignItems: "center",
  background: "#f5f5f5",
  padding: "5px 15px",
  borderRadius: "50px",
  width: "200px",
};
const searchField = {
  background: "none",
  border: "none",
  outline: "none",
  marginLeft: "8px",
  width: "100%",
  fontSize: "12px",
};
const adminOuter = {
  height: "100vh",
  backgroundImage:
    'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069")',
  backgroundSize: "cover",
};
const loginOverlay = {
  height: "100%",
  background: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const smallLoginCard = {
  width: "100%",
  maxWidth: "380px",
  padding: "50px 40px",
  background: "#fff",
  borderRadius: "15px",
  textAlign: "center",
};
const profileCircle = {
  width: "90px",
  height: "90px",
  borderRadius: "50%",
  background: "#f9f9f9",
  margin: "0 auto 25px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  border: "2px solid #D4AF37",
};
const profileImgStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};
const editPicIcon = {
  position: "absolute",
  bottom: "0",
  right: "0",
  background: "#000",
  padding: "6px",
  borderRadius: "50%",
  cursor: "pointer",
  border: "2px solid #fff",
};
const smallIn = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  border: "1px solid #eee",
  textAlign: "center",
  borderRadius: "8px",
};
const smallBtn = {
  width: "100%",
  padding: "15px",
  background: "#000",
  color: "#D4AF37",
  border: "none",
  fontWeight: "900",
  cursor: "pointer",
  borderRadius: "8px",
};
const backToShopLink = {
  display: "block",
  marginTop: "25px",
  fontSize: "11px",
  color: "#888",
  textDecoration: "none",
};
const controlPanel = {
  background: "#fff",
  border: "1px solid #eee",
  padding: "30px",
  borderRadius: "12px",
};
const previewPanel = {
  background: "#fbfbfb",
  border: "1px solid #eee",
  padding: "30px",
  borderRadius: "12px",
};
const sectionLabel = {
  fontSize: "11px",
  letterSpacing: "2px",
  fontWeight: "900",
  marginBottom: "25px",
  borderBottom: "2px solid #000",
  paddingBottom: "10px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};
const admIn = {
  width: "100%",
  padding: "15px",
  marginBottom: "15px",
  border: "1px solid #eee",
  fontWeight: "bold",
  borderRadius: "8px",
  boxSizing: "border-box",
};
const admBtn = {
  width: "100%",
  padding: "18px",
  background: "#000",
  color: "#D4AF37",
  border: "none",
  fontWeight: "900",
  cursor: "pointer",
  borderRadius: "8px",
};
const boldBack = {
  fontWeight: "900",
  textDecoration: "none",
  color: "#000",
  fontSize: "12px",
};
const logoutBtn = {
  background: "none",
  border: "1px solid #000",
  padding: "8px 15px",
  fontWeight: "900",
  fontSize: "10px",
  cursor: "pointer",
  borderRadius: "5px",
};
const prevImg = { width: "100%", height: "100%", objectFit: "cover" };
const prevPlaceholder = {
  height: "100%",
  background: "#f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const invRow = {
  display: "flex",
  alignItems: "center",
  background: "#fff",
  padding: "15px",
  border: "1px solid #eee",
  borderRadius: "10px",
  marginBottom: "10px",
};
const viewReceiptBtn = {
  background: "#000",
  color: "#D4AF37",
  padding: "8px 15px",
  cursor: "pointer",
  border: "none",
  fontWeight: "900",
  borderRadius: "5px",
  fontSize: "11px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

export default Admin;
