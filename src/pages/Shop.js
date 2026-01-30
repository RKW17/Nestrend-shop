import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy } from "firebase/firestore";
import {
  X,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Camera,
  CheckCircle2,
  Navigation,
  Download,
  Star, 
  MessageSquare,
  Filter 
} from "lucide-react";
import { formatGHS } from "../App";

const Shop = function ({
  products,
  cart,
  setCart,
  category,
  subcategory,
  setSubcategory,
  showCart,
  setShowCart,
  cartTotal,
  searchQuery,
  setOrders,
  subcategoryMap,
}) {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [momoReceipt, setMomoReceipt] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    region: "",
  });
  const [geoLink, setGeoLink] = useState("");

  const [allReviews, setAllReviews] = useState([]); 
  const [reviews, setReviews] = useState([]);    
  const [revName, setRevName] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState(5);

  // Sync Orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (setOrders) setOrders(ordersData); 
    });
    return () => unsubscribe();
  }, [setOrders]);

  // Load Reviews
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Filter Reviews for selected product
  useEffect(() => {
    if (selected) {
      const q = query(collection(db, "reviews"), where("productId", "==", selected.id), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [selected]);

  const getProductRating = (id) => {
    const pReviews = allReviews.filter(r => r.productId === id);
    if (pReviews.length === 0) return null;
    const avg = pReviews.reduce((acc, r) => acc + r.rating, 0) / pReviews.length;
    return { avg: avg.toFixed(1), count: pReviews.length };
  };

  const submitReview = async () => {
    if (!revName || !revText) return alert("Please add your name and a comment.");
    try {
      await addDoc(collection(db, "reviews"), {
        productId: selected.id, productName: selected.name, name: revName, comment: revText, rating: revRating, date: new Date().toISOString()
      });
      setRevName(""); setRevText(""); setRevRating(5);
    } catch (e) { alert("Error adding review"); }
  };

  const getLiveLocation = () => {
    if ("navigator" in window && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
          setGeoLink(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
          alert("GPS location captured!");
      }, () => alert("Location access denied."));
    }
  };

  const downloadReceipt = () => {
    if (cart.length === 0) return alert("Bag empty!");
    if (!details.name || !details.region) return alert("Please enter your Name and Region first.");
    const itemDetails = cart.map(i => `${i.name} (x${i.qty}) - ${formatGHS(i.price * i.qty)}`).join("\n");
    const receiptText = `NEX-TREND RECEIPT\nCustomer: ${details.name}\nTotal: ${formatGHS(cartTotal)}\n\nItems:\n${itemDetails}`;
    const element = document.createElement("a");
    const file = new Blob([receiptText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Nextrend_Receipt_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const addToBag = (p) => {
    if (p.colors && p.colors.trim() !== "" && !color) return alert("Select color");
    if (p.sizes && p.sizes.trim() !== "" && !selSize) return alert("Select size");
    setCart([...cart, { ...p, qty, selColor: color, chosenSize: selSize }]);
    setSelected(null); setQty(1); setColor(""); setSelSize("");
  };

  const sendOrderToManager = async () => {
    if (!details.name || !details.phone || !momoReceipt) return alert("Fill details and upload receipt.");
    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(momoReceipt);
    reader.onloadend = async () => {
      try {
        await addDoc(collection(db, "orders"), {
          name: details.name, phone: details.phone, region: details.region,
          location: details.location + (geoLink ? " (GPS)" : ""),
          total: cartTotal, receiptUrl: reader.result, date: new Date().toISOString(),
          items: cart.map(i => `${i.name} (x${i.qty})`).join(", "), status: "pending",
        });
        setShowSuccess(true); setCart([]); setIsUploading(false);
      } catch (e) { alert("Error sending order."); setIsUploading(false); }
    };
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      {showSuccess && (
        <div style={styles.successOverlay}>
          <div style={styles.successCard}>
            <CheckCircle2 size={80} color="#D4AF37" />
            <h2 style={{ fontFamily: "Playfair Display", fontSize: "32px", margin: "20px 0" }}>Order Confirmed!</h2>
            <button onClick={() => { setShowSuccess(false); setShowCart(false); }} style={styles.completeBtn}>RETURN TO SHOP</button>
          </div>
        </div>
      )}

      {category !== "All" && subcategoryMap && subcategoryMap[category] && (
        <div style={styles.subFilterBar}>
          <Filter size={16} color="#D4AF37" />
          <button onClick={() => setSubcategory("All")} style={{...styles.subBtn, borderBottom: subcategory === "All" ? "3px solid #D4AF37" : "none", color: subcategory === "All" ? "#000" : "#555"}}>All {category}</button>
          {subcategoryMap[category].map(sub => (
            <button key={sub} onClick={() => setSubcategory(sub)} style={{...styles.subBtn, borderBottom: subcategory === sub ? "3px solid #D4AF37" : "none", color: subcategory === sub ? "#000" : "#555"}}>{sub}</button>
          ))}
        </div>
      )}

      <div style={styles.fixedGrid}>
        {products
          .filter((p) => {
            const mS = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const mC = category === "All" || p.category === category;
            const mSub = subcategory === "All" || !subcategory || p.subcategory === subcategory;
            return mS && mC && mSub;
          })
          .map((p) => {
            const rating = getProductRating(p.id);
            return (
              <div key={p.id} onClick={() => setSelected(p)} style={styles.luxuryCard}>
                <div style={styles.imgBox}><img src={p.img} alt={p.name} style={styles.fixedImg} />{!p.inStock && <div style={styles.soldOutOverlay}>STOCK OUT</div>}</div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.stylishName}>{p.name}</h4>
                  <p style={styles.heavyPrice}>{formatGHS(p.price)}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '5px' }}>
                    {rating && <><Star size={12} fill="#D4AF37" color="#D4AF37" /><span style={{ fontSize: '12px', fontWeight: '900', color: '#000' }}>{rating.avg}</span></>}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {selected && (
        <div style={styles.popOverlay}>
          <div style={styles.popContent}>
            <X onClick={() => setSelected(null)} style={styles.popClose} size={45} />
            <div style={styles.popLayout}>
              <div style={styles.popImgBox}>
                <img src={selected.img} alt="" style={styles.fullImg} />
                
                <div style={styles.reviewContainer}>
                   <h3 style={{fontFamily: 'Playfair Display', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <MessageSquare size={20} color="#D4AF37" /> Customer Reviews
                   </h3>
                   <div style={styles.reviewList}>
                      {reviews.length === 0 ? <p style={{opacity: 0.5}}>No reviews yet. Be the first!</p> : 
                        reviews.map(r => (
                          <div key={r.id} style={styles.reviewItem}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                               <strong>{r.name}</strong>
                               <div style={{color: '#D4AF37'}}>{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="#D4AF37" color="#D4AF37"/>)}</div>
                            </div>
                            <p style={{margin: '5px 0', fontSize: '14px'}}>{r.comment}</p>
                          </div>
                        ))
                      }
                   </div>
                   <div style={styles.reviewForm}>
                      <p style={styles.miniLab}>ADD A REVIEW</p>
                      <input placeholder="Your Name" style={styles.luxeInput} value={revName} onChange={e => setRevName(e.target.value)} />
                      <div style={{display: 'flex', gap: '8px', marginBottom: '15px'}}>
                        {[1,2,3,4,5].map(num => (
                          <Star key={num} size={24} onClick={() => setRevRating(num)} fill={revRating >= num ? "#D4AF37" : "none"} color={revRating >= num ? "#D4AF37" : "#ccc"} style={{cursor: 'pointer'}} />
                        ))}
                      </div>
                      <textarea placeholder="Share experience..." style={{...styles.luxeInput, height: '80px'}} value={revText} onChange={e => setRevText(e.target.value)} />
                      <button onClick={submitReview} style={styles.completeBtn}>SUBMIT REVIEW</button>
                   </div>
                </div>
              </div>

              <div style={styles.popDetails}>
                <h1 style={styles.popTitle}>{selected.name}</h1>
                <p style={styles.popPrice}>{formatGHS(selected.price)}</p>
                <p style={styles.popDesc}>{selected.desc}</p>
                
                <div style={{ display: "flex", gap: "25px", alignItems: "flex-end", marginBottom: "40px" }}>
                  {selected.colors && (
                    <div style={{ flex: 1 }}>
                      <p style={styles.miniLab}>COLOR</p>
                      <select onChange={(e) => setColor(e.target.value)} style={styles.luxeSel}>
                        <option value="">Choose...</option>
                        {selected.colors.split(",").map((c) => (<option key={c} value={c.trim()}>{c.trim()}</option>))}
                      </select>
                    </div>
                  )}
                  <div style={{ flex: 1.5 }}>
                    <p style={styles.miniLab}>QUANTITY</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div style={styles.qtyFlex}>
                        <Minus size={22} onClick={() => qty > 1 && setQty(qty - 1)} style={{ cursor: "pointer" }} />
                        <span style={{ fontSize: "18px", fontWeight: "900" }}>{qty}</span>
                        <Plus size={22} onClick={() => setQty(qty + 1)} style={{ cursor: "pointer" }} />
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: "900", color: "#000" }}>
                        = <span style={{ color: "#D4AF37" }}>{formatGHS(selected.price * qty)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => addToBag(selected)} style={styles.luxeAddBtn} disabled={!selected.inStock}>
                  {selected.inStock ? "ADD TO BAG" : "STOCK OUT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <div style={styles.cartOverlay}>
          <div style={styles.cartSidebar}>
             <div style={styles.sideHeader}>
              <h2 style={{ fontFamily: "Playfair Display", fontSize: "28px", fontWeight: "900" }}>BAG</h2>
              <X onClick={() => setShowCart(false)} style={{ cursor: "pointer" }} size={28} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={styles.cartItemStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "900", color: "#000" }}>{item.name}</p>
                      <p style={{ margin: 0, color: "#D4AF37", fontSize: "15px", fontWeight: "800" }}>{formatGHS(item.price * item.qty)} (x{item.qty})</p>
                    </div>
                    <Trash2 size={18} onClick={() => setCart(cart.filter((_, i) => i !== idx))} color="red" style={{cursor:'pointer'}} />
                  </div>
                ))}
            </div>
            <div style={styles.checkoutSection}>
                <div style={styles.momoLuxeCard}>
                   <span style={{ fontWeight: "bold", display: "block" }}>Momo: 0245637030</span>
                   <span style={{ fontWeight: "bold", color: "#D4AF37", display: "block" }}>Grace Antwiwaa Asirifi</span>
                   <label style={styles.uploadMomo}>
                     <Camera size={20} /> {momoReceipt ? "RECEIPT LOADED" : "UPLOAD RECEIPT"}
                     <input type="file" hidden onChange={(e) => setMomoReceipt(e.target.files[0])} />
                   </label>
                </div>
                <input placeholder="Full Name" style={styles.luxeInput} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
                <input placeholder="Phone" style={styles.luxeInput} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
                <select style={styles.luxeInput} onChange={(e) => setDetails({ ...details, region: e.target.value })}>
                   <option value="">Select Region</option>
                   {["Greater Accra", "Ashanti", "Western", "Central", "Eastern", "Northern", "Volta"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div style={{ position: "relative", marginBottom: "15px" }}>
                  <MapPin size={18} style={{ position: "absolute", left: "15px", top: "18px", color: "#888" }} />
                  <input placeholder="Address..." style={{ ...styles.luxeInput, paddingLeft: "45px" }} onChange={(e) => setDetails({ ...details, location: e.target.value })} />
                  <button onClick={getLiveLocation} style={{...styles.gpsBtn, background: geoLink ? "#4CAF50" : "#D4AF37"}}>
                    <Navigation size={14} /> {geoLink ? "GPS CAPTURED" : "ADD LIVE GPS"}
                  </button>
                </div>
                <div style={styles.totalLine}>TOTAL: {formatGHS(cartTotal)}</div>
                <div style={{display: 'flex', gap: '10px'}}>
                   <button onClick={downloadReceipt} style={styles.receiptBtnStyle}><Download size={22} /></button>
                   <button onClick={sendOrderToManager} style={styles.completeBtn} disabled={isUploading}>{isUploading ? "UPLOADING..." : "COMPLETE ORDER"}</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  subFilterBar: { display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0 30px', alignItems: 'center' },
  subBtn: { background: 'none', border: 'none', padding: '5px 12px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', whiteSpace: 'nowrap' },
  fixedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "25px" },
  luxuryCard: { background: "#fff", border: "1px solid #eee", cursor: "pointer" },
  imgBox: { height: "350px", overflow: "hidden", position: "relative" },
  fixedImg: { width: "100%", height: "100%", objectFit: "cover" },
  cardInfo: { padding: "15px", textAlign: "center" },
  stylishName: { fontSize: "15px", fontWeight: "900", color: "#000", textTransform: "uppercase" },
  heavyPrice: { fontSize: "20px", fontWeight: "900", color: "#D4AF37" },
  popOverlay: { position: "fixed", inset: 0, background: "#fff", zIndex: 5000, display: "flex", padding: "30px", overflowY: "auto" },
  popContent: { width: "100%", maxWidth: "1200px", margin: "auto", position: "relative" },
  popLayout: { display: "flex", gap: "40px", flexWrap: "wrap" },
  popImgBox: { flex: 1.2, minWidth: "300px" },
  fullImg: { width: "100%", height: "auto", objectFit: "contain" },
  popDetails: { flex: 0.8, minWidth: "300px" },
  popTitle: { fontFamily: "Playfair Display", fontSize: "36px", color: "#000", fontWeight: "900" },
  popPrice: { fontSize: "28px", fontWeight: "900", color: "#D4AF37", marginBottom: "15px" },
  popDesc: { lineHeight: "1.6", color: "#000", fontWeight: "500", marginBottom: "25px" },
  miniLab: { fontSize: "12px", fontWeight: "900", color: "#000", marginBottom: "8px" },
  qtyFlex: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "2px solid #000", padding: "8px", width: "120px" },
  luxeSel: { width: "100%", padding: "12px", border: "2px solid #000", fontWeight: "900" },
  luxeAddBtn: { width: "100%", padding: "20px", background: "#000", color: "#D4AF37", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "18px" },
  popClose: { position: "absolute", top: "-10px", right: "0", cursor: "pointer" },
  successOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" },
  successCard: { background: "#fff", padding: "40px", borderRadius: "15px", textAlign: "center" },
  completeBtn: { width: "100%", padding: "18px", background: "#000", color: "#D4AF37", border: "none", fontWeight: "900", cursor: "pointer" },
  soldOutOverlay: { position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", color: "red", fontSize: "20px" },
  cartOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", justifyContent: "flex-end" },
  cartSidebar: { width: "100%", maxWidth: "400px", background: "#fff", height: "100%", display: "flex", flexDirection: "column" },
  sideHeader: { padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" },
  cartItemStyle: { display: "flex", alignItems: "center", padding: "15px", borderBottom: "1px solid #f9f9f9" },
  checkoutSection: { padding: "20px", background: "#fcfcfc" },
  totalLine: { textAlign: "right", fontWeight: "900", fontSize: "24px", marginBottom: "15px", color: "#000" },
  reviewContainer: { marginTop: '40px', background: '#f9f9f9', padding: '20px', borderRadius: '10px' },
  reviewList: { maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' },
  reviewItem: { background: '#fff', padding: '12px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #eee' },
  reviewForm: { borderTop: '2px solid #000', paddingTop: '20px' },
  luxeInput: { width: "100%", padding: "12px", border: "1px solid #ddd", marginBottom: "8px", boxSizing: "border-box" },
  momoLuxeCard: { background: "#000", padding: "12px", borderRadius: "8px", color: "#fff", textAlign: "center", marginBottom: "15px" },
  uploadMomo: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#fff", color: "#000", padding: "8px", borderRadius: "5px", cursor: "pointer", fontWeight: "900", fontSize: "11px" },
  gpsBtn: { border: "none", padding: "6px 10px", borderRadius: "5px", fontSize: "9px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", marginTop: "5px" },
  receiptBtnStyle: { flex: "0.2", padding: "15px", background: "#f1f1f1", border: "1px solid #ddd", cursor: "pointer", display: "flex", justifyContent: "center" }
};

export default Shop;