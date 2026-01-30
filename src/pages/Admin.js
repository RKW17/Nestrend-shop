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
  orderBy,
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
  Star,
  MessageSquare,
  ShoppingCart,
  MapPin,
  ExternalLink,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatGHS } from "../App";

const subcategoryMap = {
  "Beauty & Personal Care": ["Wigs & Hair Extensions", "Skincare", "Haircare", "Makeup", "Personal Hygiene"],
  "Fashion & Apparel": ["Men's Clothing", "Women's Clothing", "Footwear", "Fashion Accessories"],
  Electronics: ["Mobile Phones", "Computers", "Audio", "Smart Gadgets"],
  "Mobile Accessories": ["Phone Cases", "Chargers", "Screen Protectors", "Power Banks", "Earphones & Headphones", "Smartwatches", "Phone Holders/Stands"],
  "Home & Living": ["Home Essentials", "Kitchen & Dining", "Home Utilities", "Home Appliances"],
};

const Admin = ({
  products = [],
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
  const [allReviews, setAllReviews] = useState([]);
  const [previewImage, setPreviewImage] = useState(null); 
  
  const [form, setForm] = useState({
    name: "", price: "", desc: "", colors: "", sizes: "",
    category: "Beauty & Personal Care", subcategory: "", img: "", inStock: true,
  });
  const [imgFile, setImgFile] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      const qOrders = query(collection(db, "orders"), orderBy("date", "desc"));
      const unsubOrders = onSnapshot(qOrders, (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLocalOrders(ordersData);
        if (typeof setOrders === "function") setOrders(ordersData);
      });

      const qReviews = query(collection(db, "reviews"), orderBy("date", "desc"));
      const unsubReviews = onSnapshot(qReviews, (snapshot) => {
        setAllReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => { unsubOrders(); unsubReviews(); };
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
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
    const data = await response.json();
    if (data.success) return data.data.url;
    throw new Error("ImgBB Upload Failed");
  };

  const saveProduct = async () => {
    if (!form.name || !form.img) return alert("Name and Image are required.");
    setIsUploading(true);
    try {
      let finalImgUrl = form.img;
      if (imgFile) finalImgUrl = await uploadToImgBB(imgFile);
      const productData = { ...form, img: finalImgUrl };
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      setForm({ name: "", price: "", desc: "", colors: "", sizes: "", category: "Beauty & Personal Care", subcategory: "", img: "", inStock: true });
      setImgFile(null);
      alert("Item Published Successfully!");
    } catch (error) { alert("Error: " + error.message); } finally { setIsUploading(false); }
  };

  const toggleStockStatus = async (product) => {
    try { await updateDoc(doc(db, "products", product.id), { inStock: !product.inStock }); } 
    catch (error) { alert(error.message); }
  };

  const quickAdd = (field, value) => {
    const current = form[field];
    const newValue = current ? `${current}, ${value}` : value;
    setForm({ ...form, [field]: newValue });
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete item?")) {
      try { await deleteDoc(doc(db, "products", id)); } catch (e) { alert(e.message); }
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm("Delete this review permanently?")) {
      try { await deleteDoc(doc(db, "reviews", id)); } catch (e) { alert("Error deleting review"); }
    }
  };

  const chatWithCustomer = (order) => {
    const cleanPhone = order.phone.replace(/\s/g, "").replace("+", "");
    const msg = `Hello ${order.name}, this is Nextrend. We have received your order! Items: ${order.items}`;
    window.open(`https://wa.me/${cleanPhone.startsWith("233") ? cleanPhone : "233" + cleanPhone}?text=${encodeURIComponent(msg)}`);
  };

  // SHARE FUNCTIONALITY
  const shareOrder = async (order) => {
    const gpsLocation = order.gps || order.digitalAddress || order.location;
    const mapUrl = gpsLocation ? `\nMap: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gpsLocation)}` : "";
    
    const shareText = `NEXTREND ORDER\nCustomer: ${order.name}\nPhone: ${order.phone}\nRegion: ${order.region}\nLocation: ${order.location}\nItems:\n${order.items}${mapUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'New Order', text: shareText });
      } catch (err) { console.log("Share failed", err); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Order details copied to clipboard!");
    }
  };

  const openMap = (location) => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, "_blank");
  };

  const displayOrders = localOrders.length > 0 ? localOrders : orders;
  const totalRevenue = displayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  if (!isAdmin) return (
    <div style={adminOuter}>
      <div style={loginOverlay}>
        <div style={smallLoginCard}>
          <div style={profileCircle}>
            {adminProfilePic ? <img src={adminProfilePic} alt="Admin" style={profileImgStyle} /> : <ShieldCheck size={40} color="#FFD700" />}
            <label style={editPicIcon}><Camera size={14} color="#fff" /><input type="file" hidden onChange={(e) => { const r = new FileReader(); r.onload = () => setAdminProfilePic(r.result); r.readAsDataURL(e.target.files[0]); }} /></label>
          </div>
          <h2 style={{ fontFamily: "Playfair Display", color: "#D4AF37", marginBottom: "10px", fontSize: "28px" }}>STAFF PORTAL</h2>
          <input type="password" placeholder="ENTER ACCESS KEY" onChange={(e) => setPass(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAuth()} style={smallIn} />
          <button onClick={handleAuth} style={smallBtn}>LOGIN</button>
          <Link to="/" style={backToShopLink}>← BACK TO SHOP</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "80px 50px", maxWidth: "1600px", margin: "0 auto", backgroundColor: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", alignItems: "center" }}>
        <Link to="/" style={boldBack}>← STOREFRONT</Link>
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={miniStat}><ShoppingCart size={16} color="#D4AF37" /> <strong style={{fontSize: "15px", color: "#000"}}>ORDERS: {displayOrders.length}</strong></div>
          <div style={miniStat}><MessageSquare size={16} color="#D4AF37" /> <strong style={{fontSize: "15px", color: "#000"}}>REVIEWS: {allReviews.length}</strong></div>
          <div style={miniStat}><TrendingUp size={16} color="#D4AF37" /> <strong style={{fontSize: "15px", color: "#000"}}>REVENUE: {formatGHS(totalRevenue)}</strong></div>
          <button onClick={() => setIsAdmin(false)} style={logoutBtn}><LogOut size={22} /> LOGOUT</button>
        </div>
      </div>

      <div style={adminSplit}>
        <div style={controlPanel}>
          <h3 style={sectionLabel}>{editingId ? "UPDATE STOCK" : "ADD NEW STOCK"}</h3>
          <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={admIn} />
          <input placeholder="Price (GHS)" value={form.price} type="number" onChange={(e) => setForm({ ...form, price: e.target.value })} style={admIn} />
          <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{ ...admIn, height: "100px", resize: "none" }} />
          <div style={{ marginBottom: "20px" }}>
            <p style={miniLabel}>QUICK COLORS</p>
            <div style={quickPickRow}>{["Black", "White", "Red", "Gold", "Nude", "Blue"].map((c) => (<span key={c} onClick={() => quickAdd("colors", c)} style={tagBtn}>{c}</span>))}</div>
            <input placeholder="Colors" value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} style={{ ...admIn, marginTop: "5px" }} />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <p style={miniLabel}>QUICK SIZES</p>
            <div style={quickPickRow}>{["S", "M", "L", "XL", "38", "40", "42", "44","45"].map((s) => (<span key={s} onClick={() => quickAdd("sizes", s)} style={tagBtn}>{s}</span>))}</div>
            <input placeholder="Sizes" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} style={{ ...admIn, marginTop: "5px" }} />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })} style={admIn}>
              {Object.keys(subcategoryMap).map((c) => (<option key={c}>{c}</option>))}
            </select>
            <select value={form.subcategory || ""} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} style={admIn} disabled={!form.category}>
              <option value="">Subcategory</option>
              {form.category && subcategoryMap[form.category]?.map((sub) => (<option key={sub} value={sub}>{sub}</option>))}
            </select>
          </div>
          <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setImgFile(file); const r = new FileReader(); r.onload = () => setForm({ ...form, img: r.result }); r.readAsDataURL(file); } }} style={{ marginBottom: "20px", fontSize: "14px", fontWeight: "bold" }} />
          <button onClick={saveProduct} style={admBtn} disabled={isUploading}>{isUploading ? "UPLOADING..." : editingId ? "SAVE CHANGES" : "PUBLISH ITEM"}</button>
        </div>

        <div style={previewPanel}>
          <h3 style={sectionLabel}><Eye size={18} /> LIVE PREVIEW</h3>
          <div style={previewInnerBoxStyle}>
            <div style={previewContent}>
              <div style={prevImgWrap}>
                {form.img ? (
                  <img src={form.img} alt="Preview" style={prevImg} />
                ) : (
                  <div style={prevPlaceholder}><Package size={80} color="#ddd" /></div>
                )}
              </div>
              <div style={{ flex: 1.2 }}>
                <h2 style={prevTitle}>{form.name || "PRODUCT NAME"}</h2>
                <p style={prevPrice}>{formatGHS(form.price || 0)}</p>
                <div style={prevBadgeRow}><span style={catBadge}>{form.category}</span>{form.subcategory && <span style={subBadge}>{form.subcategory}</span>}</div>
                <p style={prevDesc}>{form.desc || "Provide a product description..."}</p>
                {form.sizes && <div style={{ marginTop: "25px" }}><p style={miniLabel}>AVAILABLE SIZES</p><div style={prevTagRow}>{form.sizes.split(",").map((s) => (<span key={s} style={sizeBox}>{s.trim()}</span>))}</div></div>}
                {form.colors && <div style={{ marginTop: "25px" }}><p style={miniLabel}>AVAILABLE COLORS</p><div style={prevTagRow}>{form.colors.split(",").map((c) => (<span key={c} style={colorBox}>{c.trim()}</span>))}</div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={sectionWrapper}>
        <h3 style={sectionLabel}><FileText size={22} /> INCOMING REQUESTS ({displayOrders.length})</h3>
        {displayOrders.map((order) => {
          const receipt = order.receiptUrl || order.momoReceipt || order.receipt;
          const gpsLocation = order.gps || order.digitalAddress || order.location;

          return (
            <div key={order.id} style={invRow}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <p style={{ margin: 0, fontWeight: "1000", fontSize: "24px", color: "#000" }}>{order.name?.toUpperCase()}</p>
                  <span style={pendingBadge}><Clock size={14} /> PENDING</span>
                </div>
                <p style={{ margin: "10px 0", fontSize: "18px", color: "#C59E1A", fontWeight: "1000" }}>{order.phone} | {order.region}</p>
                
                <div style={locationContainer}>
                   <p style={{ margin: "5px 0", fontSize: "15px", color: "#000", fontWeight: "1000", display: "flex", alignItems: "center", gap: "8px" }}>
                     <MapPin size={16} /> LOCATION: {order.location || "Not Provided"}
                   </p>
                   {gpsLocation && (
                     <button onClick={() => openMap(gpsLocation)} style={mapLinkBtn}>
                       <ExternalLink size={14} /> OPEN IN GOOGLE MAPS
                     </button>
                   )}
                </div>

                <div style={itemBox}><pre style={itemPre}>{order.items}</pre></div>
                <div style={{ display: "flex", gap: "15px", marginTop: "20px", flexWrap: "wrap" }}>
                  {receipt ? (
                    <button onClick={() => setPreviewImage(receipt)} style={viewReceiptBtn}>
                      <ImageIcon size={18} /> VIEW PHOTO
                    </button>
                  ) : (
                    <button style={{ ...viewReceiptBtn, opacity: 0.5 }} disabled><XCircle size={18} /> NO PHOTO</button>
                  )}
                  <button onClick={() => chatWithCustomer(order)} style={whatsappBtn}><MessageCircle size={18} /> WHATSAPP</button>
                  <button onClick={() => shareOrder(order)} style={shareBtn}><Share2 size={18} /> SHARE ORDER</button>
                </div>
              </div>
              <Trash2 size={32} color="red" style={{ cursor: "pointer", marginLeft: "25px" }} onClick={async () => { if (window.confirm("Delete order?")) await deleteDoc(doc(db, "orders", order.id)); }} />
            </div>
          );
        })}
      </div>

      <div style={sectionWrapper}>
        <h3 style={sectionLabel}><MessageSquare size={22} /> CUSTOMER REVIEWS ({allReviews.length})</h3>
        <div style={reviewGrid}>
          {allReviews.map((rev) => (
            <div key={rev.id} style={reviewCard}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <p style={{fontWeight: '1000', margin: 0, fontSize: "18px", color: "#000"}}>{rev.name}</p>
                  <p style={{fontSize: "14px", color: '#D4AF37', fontWeight: "1000"}}>{rev.productName}</p>
                </div>
                <Trash2 size={20} color="red" style={{cursor: 'pointer'}} onClick={() => deleteReview(rev.id)} />
              </div>
              <div style={{display: 'flex', gap: '3px', margin: '10px 0'}}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? "#D4AF37" : "none"} color="#D4AF37" />)}
              </div>
              <p style={{fontSize: '15px', color: '#000', lineHeight: "1.5", fontWeight: "500"}}>{rev.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionWrapper}>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "4px solid #000", paddingBottom: "15px", marginBottom: "35px" }}>
          <h3 style={{ ...sectionLabel, borderBottom: "none", marginBottom: 0, fontSize: "22px" }}>INVENTORY</h3>
          <div style={searchBarContainer}><Search size={22} color="#000" /><input placeholder="Search Inventory..." onChange={(e) => setSearchTerm(e.target.value)} style={searchField} /></div>
        </div>
        {products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
          <div key={p.id} style={invRow}>
            <img src={p.img} alt="" style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "10px", border: "1px solid #ddd" }} />
            <div style={{ flex: 1, marginLeft: "30px" }}>
              <p style={{ fontWeight: "1000", margin: 0, fontSize: "20px", color: "#000" }}>{p.name}</p>
              <p style={{ color: "#D4AF37", fontWeight: "1000", fontSize: "18px" }}>{formatGHS(p.price)}</p>
            </div>
            <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
              <div onClick={() => toggleStockStatus(p)} style={{ cursor: "pointer" }}>{p.inStock ? <CheckCircle color="green" size={28} /> : <XCircle color="red" size={28} />}</div>
              <Edit3 onClick={() => { setEditingId(p.id); setForm(p); window.scrollTo(0, 0); }} color="#D4AF37" size={28} style={{ cursor: "pointer" }} />
              <Trash2 onClick={() => deleteProduct(p.id)} color="red" size={28} style={{ cursor: "pointer" }} />
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={overlayStyle}>
          <img src={previewImage} alt="Receipt" style={{ maxWidth: '95%', maxHeight: '95vh', borderRadius: '15px', border: "5px solid #fff" }} />
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const shareBtn = { background: "#000", color: "#FFD700", padding: "14px 25px", cursor: "pointer", border: "none", fontWeight: "1000", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" };
const locationContainer = { margin: "15px 0", background: "#fdfdfd", padding: "10px", borderRadius: "8px", border: "1px dashed #ddd" };
const mapLinkBtn = { background: "none", border: "none", color: "#0066FF", fontWeight: "1000", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", textDecoration: "underline", padding: "5px 0" };
const sectionWrapper = { marginTop: "100px", backgroundColor: "#f4f4f4", padding: "40px", borderRadius: "20px", border: "1px solid #e0e0e0" };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.98)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, cursor: 'pointer' };
const reviewGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const reviewCard = { background: '#fff', padding: '25px', borderRadius: '15px', border: "1px solid #ddd", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" };
const itemBox = { background: "#fff", padding: "20px", borderRadius: "12px", border: "2px solid #000" };
const itemPre = { margin: 0, fontSize: "16px", whiteSpace: "pre-wrap", fontFamily: "inherit", color: "#000", fontWeight: "700" };
const pendingBadge = { background: "#000", color: "#FFD700", padding: "6px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "1000", display: "flex", alignItems: "center", gap: "8px" };
const adminSplit = { display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "60px", alignItems: "start" };
const previewInnerBoxStyle = { background: "#fff", padding: "45px", border: "1px solid #eee", borderRadius: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" };
const prevImgWrap = { flex: 1, minWidth: "300px", minHeight: "300px", maxHeight: "600px", borderRadius: "15px", overflow: "hidden", border: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" };
const prevImg = { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" };
const prevTitle = { fontFamily: "Playfair Display", fontSize: "36px", margin: "0 0 12px 0", fontWeight: "1000", color: "#000" };
const prevPrice = { color: "#D4AF37", fontWeight: "1000", fontSize: "32px" };
const prevDesc = { fontSize: "18px", color: "#000", lineHeight: "1.6", fontWeight: "500" };
const sizeBox = { border: "3px solid #000", padding: "10px 20px", fontSize: "16px", fontWeight: "1000", color: "#000" };
const colorBox = { background: "#000", padding: "10px 20px", fontSize: "16px", fontWeight: "1000", color: "#FFD700", borderRadius: "6px" };
const quickPickRow = { display: "flex", gap: "10px", flexWrap: "wrap" };
const tagBtn = { background: "#000", padding: "8px 15px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontWeight: "1000", color: "#FFD700" };
const previewContent = { display: "flex", gap: "60px", flexWrap: "wrap", alignItems: "start" };
const prevBadgeRow = { display: "flex", gap: "12px", margin: "25px 0" };
const catBadge = { background: "#000", color: "#FFD700", fontSize: "14px", padding: "8px 18px", borderRadius: "50px", fontWeight: "1000" };
const subBadge = { background: "#D4AF37", color: "#000", fontSize: "14px", padding: "8px 18px", borderRadius: "50px", fontWeight: "1000" };
const prevTagRow = { display: "flex", gap: "12px", flexWrap: "wrap" };
const miniLabel = { fontSize: "13px", fontWeight: "1000", color: "#000", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" };
const miniStat = { background: "#fff", border: "2px solid #000", padding: "12px 25px", borderRadius: "50px", display: "flex", alignItems: "center", gap: "12px" };
const whatsappBtn = { background: "#25D366", color: "#fff", padding: "14px 25px", cursor: "pointer", border: "none", fontWeight: "1000", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" };
const searchBarContainer = { display: "flex", alignItems: "center", background: "#fff", border: "2px solid #000", padding: "10px 25px", borderRadius: "50px", width: "350px" };
const searchField = { background: "none", border: "none", outline: "none", marginLeft: "12px", fontSize: "16px", fontWeight: "1000", width: "100%", color: "#000" };
const adminOuter = { height: "100vh", backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069")', backgroundSize: "cover" };
const loginOverlay = { height: "100%", background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" };
const smallLoginCard = { width: "100%", maxWidth: "450px", padding: "70px 50px", background: "#fff", borderRadius: "25px", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" };
const profileCircle = { width: "110px", height: "110px", borderRadius: "50%", background: "#f9f9f9", margin: "0 auto 35px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "4px solid #D4AF37" };
const profileImgStyle = { width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" };
const editPicIcon = { position: "absolute", bottom: "5px", right: "5px", background: "#000", padding: "10px", borderRadius: "50%", cursor: "pointer" };
const smallIn = { width: "100%", padding: "20px", marginBottom: "25px", border: "2px solid #ddd", textAlign: "center", borderRadius: "12px", fontSize: "18px", fontWeight: "1000", color: "#000" };
const smallBtn = { width: "100%", padding: "20px", background: "#000", color: "#FFD700", border: "none", fontWeight: "1000", borderRadius: "12px", fontSize: "18px", cursor: "pointer" };
const backToShopLink = { display: "block", marginTop: "35px", fontSize: "16px", color: "#000", textDecoration: "none", fontWeight: "1000" };
const controlPanel = { background: "#fff", border: "1px solid #eee", padding: "45px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.06)" };
const previewPanel = { background: "#fcfcfc", border: "1px solid #eee", padding: "45px", borderRadius: "20px" };
const sectionLabel = { fontSize: "16px", letterSpacing: "2.5px", fontWeight: "1000", marginBottom: "35px", borderBottom: "4px solid #000", paddingBottom: "15px", display: "flex", alignItems: "center", gap: "15px", textTransform: "uppercase", color: "#000" };
const admIn = { width: "100%", padding: "20px", marginBottom: "25px", border: "2px solid #eee", fontWeight: "1000", borderRadius: "12px", boxSizing: "border-box", fontSize: "16px", color: "#000" };
const admBtn = { width: "100%", padding: "22px", background: "#000", color: "#FFD700", border: "none", fontWeight: "1000", borderRadius: "12px", fontSize: "18px", cursor: "pointer" };
const boldBack = { fontWeight: "1000", textDecoration: "none", color: "#000", fontSize: "16px" };
const logoutBtn = { background: "#000", color: "#FFD700", border: "none", padding: "12px 30px", fontWeight: "1000", fontSize: "14px", cursor: "pointer", borderRadius: "10px" };
const prevPlaceholder = { height: "300px", width: "100%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" };
const invRow = { display: "flex", alignItems: "center", background: "#fff", padding: "30px", border: "2px solid #eee", borderRadius: "15px", marginBottom: "20px", boxShadow: "0 6px 12px rgba(0,0,0,0.04)" };
const viewReceiptBtn = { background: "#000", color: "#FFD700", padding: "14px 25px", cursor: "pointer", border: "none", fontWeight: "1000", borderRadius: "10px", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" };

export default Admin;