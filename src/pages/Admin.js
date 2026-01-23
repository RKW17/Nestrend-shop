import React, { useState } from "react";
import {
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  Package,
  LogOut,
  ShieldCheck,
  Eye,
  Camera,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatGHS } from "../App";
import { createClient } from '@supabase/supabase-js';

// --- DATABASE CONNECTION ---
const supabase = createClient(
  'https://uharacw4ivuzueidotqx.supabase.co', 
  'sb_publishable_UhA0rRAcW4IvuwzueIDOtQ_xciyqqpr'
);

const subcategoryMap = {
  "Beauty & Personal Care": ["Wigs & Hair Extensions", "Skincare", "Haircare", "Makeup", "Personal Hygiene"],
  "Fashion & Apparel": ["Men's Clothing", "Women's Clothing", "Footwear", "Fashion Accessories"],
  "Electronics": ["Mobile Phones", "Computers", "Audio", "Smart Gadgets"],
  "Mobile Accessories": ["Phone Cases", "Chargers", "Screen Protectors", "Power Banks", "Earphones & Headphones", "Smartwatches", "Phone Holders/Stands"],
  "Home & Living": ["Home Essentials", "Kitchen & Dining", "Home Utilities", "Home Appliances"],
};

const Admin = ({
  products,
  isAdmin,
  setIsAdmin,
  orders = [],
  setOrders,
  adminProfilePic,
  setAdminProfilePic,
  fetchProducts // This comes from App.js to refresh the list
}) => {
  const [pass, setPass] = useState("");
  const [editingId, setEditingId] = useState(null);
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

  const handleAuth = () => {
    if (pass === "Obiade31472") {
      setIsAdmin(true);
    } else {
      alert("Access Denied: Incorrect Key");
    }
  };

  // --- CLOUD SAVE FUNCTION ---
  const saveProduct = async () => {
    if (!form.name || !form.img) return alert("Product Name and Image are required.");

    const productData = {
      name: form.name,
      price: parseFloat(form.price) || 0,
      desc: form.desc,
      colors: form.colors,
      sizes: form.sizes,
      category: form.category,
      subcategory: form.subcategory,
      img: form.img,
      inStock: form.inStock
    };

    if (editingId) {
      // Update existing item in Supabase
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingId);
      
      if (error) alert(error.message);
      else alert("Item Updated!");
    } else {
      // Add new item to Supabase
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (error) alert(error.message);
      else alert("Item Published to Shop!");
    }

    setEditingId(null);
    setForm({ name: "", price: "", desc: "", colors: "", sizes: "", category: "Beauty & Personal Care", subcategory: "", img: "", inStock: true });
    if (fetchProducts) fetchProducts(); // Refresh the shop list
  };

  // --- CLOUD DELETE FUNCTION ---
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this item permanently?")) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) alert(error.message);
      else {
        alert("Item Deleted");
        if (fetchProducts) fetchProducts();
      }
    }
  };

  // --- TOGGLE STOCK STATUS ---
  const toggleStock = async (id, currentStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ inStock: !currentStatus })
      .eq('id', id);
    
    if (error) alert(error.message);
    else if (fetchProducts) fetchProducts();
  };

  if (!isAdmin)
    return (
      <div style={adminOuter}>
        <div style={loginOverlay}>
          <div style={smallLoginCard}>
            <div style={profileCircle}>
              {adminProfilePic ? (
                <img src={adminProfilePic} alt="Admin" style={profileImgStyle} />
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
            <h3 style={{ fontFamily: "Playfair Display", color: '#D4AF37', marginBottom: '5px', letterSpacing: '2px' }}>STAFF PORTAL</h3>
            <p style={{ fontSize: '10px', color: '#888', fontWeight: '900', marginBottom: '25px', letterSpacing: '1px' }}>AUTHORIZED ACCESS ONLY</p>
            <input type="password" placeholder="ENTER ACCESS KEY" onChange={(e) => setPass(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAuth()} style={smallIn} />
            <button onClick={handleAuth} style={smallBtn}>LOGIN</button>
            <Link to="/" style={backToShopLink}>← BACK TO SHOP</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div style={{ padding: "80px 50px", maxWidth: "1500px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "50px", alignItems: "center" }}>
        <Link to="/" style={boldBack}>← STOREFRONT</Link>
        <button onClick={() => setIsAdmin(false)} style={logoutBtn}><LogOut size={20} /> LOGOUT ADMIN</button>
      </div>

      <div style={adminSplit}>
        <div style={controlPanel}>
          <h3 style={sectionLabel}>{editingId ? "UPDATE STOCK" : "ADD NEW STOCK"}</h3>
          <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={admIn} />
          <input placeholder="Price (GHS)" value={form.price} type="number" onChange={(e) => setForm({ ...form, price: e.target.value })} style={admIn} />
          <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{ ...admIn, height: "120px" }} />
          <input placeholder="Colors (Red, Blue...)" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} style={admIn} />
          <input placeholder="Sizes (S, M, L...)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} style={admIn} />
          
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={admIn}>
            {Object.keys(subcategoryMap).map((c) => (<option key={c}>{c}</option>))}
          </select>

          <select value={form.subcategory || ""} onChange={(e) => setForm({...form, subcategory: e.target.value})} style={admIn}>
            <option value="">Select Subcategory</option>
            {subcategoryMap[form.category]?.map(sub => (<option key={sub} value={sub}>{sub}</option>))}
          </select>

          <input type="file" onChange={(e) => {
              const r = new FileReader();
              r.onload = () => setForm({ ...form, img: r.result });
              r.readAsDataURL(e.target.files[0]);
            }} style={{ marginBottom: "20px" }} />
          
          <button onClick={saveProduct} style={admBtn}>{editingId ? "SAVE CHANGES" : "PUBLISH ITEM"}</button>
        </div>

        {/* PREVIEW PANEL */}
        <div style={previewPanel}>
          <h3 style={sectionLabel}><Eye size={16} /> LIVE PREVIEW</h3>
          <div style={previewInnerBoxStyle}>
            {form.img ? <img src={form.img} alt="Preview" style={prevImg} /> : <div style={prevPlaceholder}><Package size={60} color="#ddd" /></div>}
            <div style={{ textAlign: "left", marginTop: "25px" }}>
              <h2 style={prevTitle}>{form.name || "Product Name"}</h2>
              <p style={prevPrice}>{formatGHS(form.price || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div style={{ marginTop: "80px" }}>
        <h3 style={sectionLabel}>INVENTORY MANAGEMENT</h3>
        {products.map((p) => (
          <div key={p.id} style={invRow}>
            <img src={p.img} alt="" style={{ width: "75px", height: "75px", objectFit: "cover", borderRadius: "6px" }} />
            <div style={{ flex: 1, marginLeft: "20px" }}>
              <p style={{ fontWeight: "900", margin: 0 }}>{p.name}</p>
              <p style={{ color: "#D4AF37", fontWeight: "bold", margin: 0 }}>{formatGHS(p.price)}</p>
            </div>
            <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
              <div onClick={() => toggleStock(p.id, p.inStock)} style={{ cursor: "pointer", textAlign: "center" }}>
                {p.inStock ? <CheckCircle color="green" size={24} /> : <XCircle color="red" size={24} />}
                <p style={{ fontSize: "10px", fontWeight: "900", margin: 0 }}>{p.inStock ? "IN STOCK" : "OUT"}</p>
              </div>
              <Edit3 onClick={() => { setEditingId(p.id); setForm(p); window.scrollTo(0, 0); }} color="#D4AF37" size={24} style={{ cursor: "pointer" }} />
              <Trash2 onClick={() => deleteProduct(p.id)} color="red" size={24} style={{ cursor: "pointer" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES (Keep existing styles below) ---
const adminOuter = { height: "100vh", backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069")', backgroundSize: "cover" };
const loginOverlay = { height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" };
const smallLoginCard = { width: "100%", maxWidth: "380px", padding: "50px 40px", background: "#fff", borderRadius: "15px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" };
const profileCircle = { width: "90px", height: "90px", borderRadius: "50%", background: "#f9f9f9", margin: "0 auto 25px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "2px solid #D4AF37" };
const profileImgStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" };
const editPicIcon = { position: "absolute", bottom: "0", right: "0", background: "#000", padding: "6px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" };
const smallIn = { width: "100%", padding: "15px", marginBottom: "15px", border: "1px solid #eee", textAlign: "center", fontWeight: "bold", fontSize: "15px", boxSizing: "border-box", borderRadius: "8px", outline: "none" };
const smallBtn = { width: "100%", padding: "15px", background: "#000", color: "#D4AF37", border: "none", fontWeight: "900", cursor: "pointer", borderRadius: "8px", fontSize: "14px", letterSpacing: "1px" };
const backToShopLink = { display: "block", marginTop: "25px", fontSize: "11px", color: "#888", fontWeight: "900", textDecoration: "none", borderTop: "1px solid #eee", paddingTop: "20px" };
const adminSplit = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "50px" };
const controlPanel = { background: "#fff", border: "1px solid #eee", padding: "45px", borderRadius: "12px" };
const previewPanel = { background: "#fbfbfb", border: "1px solid #eee", padding: "45px", borderRadius: "12px" };
const previewInnerBoxStyle = { background: "#fff", padding: "40px", border: "1px solid #eee", borderRadius: "8px" };
const sectionLabel = { fontSize: "12px", letterSpacing: "5px", fontWeight: "900", marginBottom: "35px", borderBottom: "2px solid #000", paddingBottom: "12px", display: "flex", alignItems: "center", gap: "12px" };
const admIn = { width: "100%", padding: "18px", marginBottom: "18px", border: "1px solid #eee", fontWeight: "bold", fontSize: "15px", boxSizing: "border-box", borderRadius: "8px" };
const admBtn = { width: "100%", padding: "20px", background: "#000", color: "#D4AF37", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "15px", borderRadius: "8px" };
const boldBack = { fontWeight: "900", textDecoration: "none", color: "#000", fontSize: "13px", letterSpacing: "1px" };
const logoutBtn = { background: "none", border: "1px solid #000", padding: "10px 20px", fontWeight: "900", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", borderRadius: "5px" };
const prevImg = { width: "100%", height: "350px", objectFit: "contain" };
const prevPlaceholder = { height: "350px", background: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
const prevTitle = { fontFamily: "Playfair Display", fontSize: "28px", margin: "0" };
const prevPrice = { color: "#D4AF37", fontWeight: "900", fontSize: "22px", marginTop: "8px" };
const invRow = { display: "flex", alignItems: "center", background: "#fff", padding: "20px", border: "1px solid #eee", borderRadius: "10px", marginBottom: "10px" };

export default Admin;