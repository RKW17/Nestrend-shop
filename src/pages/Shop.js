import React, { useState } from "react";
// Added Download to imports to prevent terminal errors
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
} from "lucide-react";
import { formatGHS } from "../App";

const Shop = ({
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
}) => {
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState("");
  const [selSize, setSelSize] = useState("");
  const [momoReceipt, setMomoReceipt] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    location: "",
    region: "",
  });
  const [geoLink, setGeoLink] = useState("");

  const getLiveLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const link = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          setGeoLink(link);
          alert("Live GPS location captured!");
        },
        () => alert("Location access denied."),
      );
    }
  };

  // STEP-BY-STEP ADDITION: RECEIPT LOGIC
  const downloadReceipt = () => {
    if (cart.length === 0) return alert("Your bag is empty!");
    if (!details.name || !details.region)
      return alert("Please enter your Name and Region first.");

    const itemDetails = cart
      .map((i) => `${i.name} (x${i.qty}) - ${formatGHS(i.price * i.qty)}`)
      .join("\n");
    const receiptText = `
    NEX-TREND - HOME OF UNIQUE LUXURY
    --------------------------------
    CUSTOMER ORDER RECEIPT
    --------------------------------
    Customer: ${details.name}
    Phone: ${details.phone}
    Region: ${details.region}
    Address: ${details.location}
    Date: ${new Date().toLocaleString()}
    
    ITEMS ORDERED:
    ${itemDetails}
    
    TOTAL AMOUNT: ${formatGHS(cartTotal)}
    --------------------------------
    THANK YOU FOR CHOOSING LUXURY.
    `;
    const element = document.createElement("a");
    const file = new Blob([receiptText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `Nextrend_Receipt_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const addToBag = (p) => {
    if (p.colors && p.colors.trim() !== "" && !color)
      return alert("Please select a color preferred");
    if (p.sizes && p.sizes.trim() !== "" && !selSize)
      return alert("Please select a size first");
    setCart([...cart, { ...p, qty, selColor: color, chosenSize: selSize }]);
    setSelected(null);
    setQty(1);
    setColor("");
    setSelSize("");
  };

  const sendOrderToManager = () => {
    if (!details.name || !details.phone || !details.region || !momoReceipt)
      return alert("Fill Name, Phone, Region and upload Receipt.");

    const itemDetails = cart
      .map(
        (i) =>
          `${i.name} ${i.chosenSize ? `(Size: ${i.chosenSize})` : ""} (x${i.qty})`,
      )
      .join("\n");

    const orderData = {
      id: Date.now(),
      name: details.name,
      phone: details.phone,
      region: details.region,
      location: details.location + (geoLink ? " (GPS Provided)" : ""),
      total: cartTotal,
      receiptUrl: URL.createObjectURL(momoReceipt),
      date: new Date().toLocaleString(),
      items: itemDetails,
    };

    setOrders((prev) => [orderData, ...prev]);

    const waText = `*--- NEW ORDER ---*%0A*CLIENT:* ${details.name}%0A*PHONE:* ${details.phone}%0A*REGION:* ${details.region}%0A*ADDRESS:* ${details.location}${geoLink ? `%0A*MAP LINK:* ${geoLink}` : ""}%0A*TOTAL:* ${formatGHS(cartTotal)}%0A%0A*ITEMS:*%0A${itemDetails}`;

    window.open(`https://wa.me/233504003676?text=${waText}`);
    setShowSuccess(true);
    setCart([]);
    setGeoLink("");
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto" }}>
      {showSuccess && (
        <div style={successOverlay}>
          <div style={successCard}>
            <CheckCircle2 size={80} color="#D4AF37" />
            <h2
              style={{
                fontFamily: "Playfair Display",
                fontSize: "32px",
                margin: "20px 0",
              }}
            >
              Order Confirmed!
            </h2>
            <p style={{ marginBottom: "25px", opacity: 0.8 }}>
              Thank you for shopping with NEX
              <span style={{ color: "#D4AF37" }}>TREND</span>
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setShowCart(false);
              }}
              style={completeBtn}
            >
              RETURN TO SHOP
            </button>
          </div>
        </div>
      )}

      {/* Grid Rendering */}
      <div style={fixedGrid}>
        {products
          .filter((p) => {
            const matchesSearch = p.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
            const matchesCategory =
              category === "All" || p.category === category;
            const matchesSub =
              subcategory === "All" ||
              !subcategory ||
              p.subcategory === subcategory;
            return matchesSearch && matchesCategory && matchesSub;
          })
          .map((p) => (
            <div key={p.id} onClick={() => setSelected(p)} style={luxuryCard}>
              <div style={imgBox}>
                <img src={p.img} alt={p.name} style={fixedImg} />
                {!p.inStock && <div style={soldOutOverlay}>STOCK OUT</div>}
              </div>
              <div style={cardInfo}>
                <h4 style={stylishName}>{p.name}</h4>
                <p style={heavyPrice}>{formatGHS(p.price)}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Item Detail Popup (The Click Feature) */}
      {selected && (
        <div style={popOverlay}>
          <div style={popContent}>
            <X onClick={() => setSelected(null)} style={popClose} size={45} />
            <div style={popLayout}>
              <div style={popImgBox}>
                <img src={selected.img} alt="" style={fullImg} />
              </div>
              <div style={popDetails}>
                <h1 style={popTitle}>{selected.name}</h1>
                <p style={popPrice}>{formatGHS(selected.price)}</p>
                <p style={popDesc}>{selected.desc}</p>
                {selected.sizes && selected.sizes.trim() !== "" && (
                  <div style={{ marginBottom: "25px" }}>
                    <p style={miniLab}>SELECT SIZE</p>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {selected.sizes.split(",").map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelSize(s.trim())}
                          style={{
                            padding: "10px 18px",
                            border:
                              selSize === s.trim()
                                ? "2px solid #D4AF37"
                                : "1px solid #000",
                            background: selSize === s.trim() ? "#000" : "#fff",
                            color: selSize === s.trim() ? "#D4AF37" : "#000",
                            fontWeight: "900",
                            cursor: "pointer",
                          }}
                        >
                          {s.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "25px",
                    alignItems: "flex-end",
                    marginBottom: "40px",
                  }}
                >
                  {selected.colors && (
                    <div style={{ flex: 1 }}>
                      <p style={miniLab}>COLOR</p>
                      <select
                        onChange={(e) => setColor(e.target.value)}
                        style={luxeSel}
                      >
                        <option value="">Choose...</option>
                        {selected.colors.split(",").map((c) => (
                          <option key={c} value={c.trim()}>
                            {c.trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div style={{ width: "140px" }}>
                    <p style={miniLab}>QTY</p>
                    <div style={qtyFlex}>
                      <Minus
                        size={22}
                        onClick={() => qty > 1 && setQty(qty - 1)}
                        style={{ cursor: "pointer" }}
                      />
                      <span>{qty}</span>
                      <Plus
                        size={22}
                        onClick={() => setQty(qty + 1)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => addToBag(selected)}
                  style={luxeAddBtn}
                  disabled={!selected.inStock}
                >
                  {selected.inStock ? "ADD TO BAG" : "STOCK OUT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div style={cartOverlay}>
          <div style={cartSidebar}>
            <div style={sideHeader}>
              <h2 style={{ fontFamily: "Playfair Display", fontSize: "28px" }}>
                BAG
              </h2>
              <X
                onClick={() => setShowCart(false)}
                style={{ cursor: "pointer" }}
                size={28}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {cart.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: "50px",
                    opacity: 0.5,
                  }}
                >
                  Your bag is empty
                </p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={cartItemStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "900" }}>
                        {item.name}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          color: "#D4AF37",
                          fontSize: "14px",
                        }}
                      >
                        {formatGHS(item.price)} x {item.qty}
                      </p>
                    </div>
                    <Trash2
                      size={18}
                      onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                      color="red"
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                ))
              )}
            </div>
            <div style={checkoutSection}>
              <div style={momoLuxeCard}>
               <span style={{ fontWeight: 'bold', display: 'block' }}>
  Momo:  0245637030
</span>
<span style={{  fontWeight: 'bold', color: '#D4AF37"', display: 'block' }}>
  Account Name: Grace Antwiwaa Asirifi
</span>
                <label style={uploadMomo}>
                  <Camera size={20} />{" "}
                  {momoReceipt ? "RECEIPT LOADED" : "UPLOAD RECEIPT"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setMomoReceipt(e.target.files[0])}
                  />
                </label>
              </div>
              <input
                placeholder="Full Name"
                style={luxeInput}
                onChange={(e) =>
                  setDetails({ ...details, name: e.target.value })
                }
              />
              <input
                placeholder="Phone Number"
                style={luxeInput}
                onChange={(e) =>
                  setDetails({ ...details, phone: e.target.value })
                }
              />

              <select
                style={luxeInput}
                onChange={(e) =>
                  setDetails({ ...details, region: e.target.value })
                }
              >
                <option value="">Select Region</option>
                {[
                  "Greater Accra",
                  "Ashanti",
                  "Western",
                  "Central",
                  "Eastern",
                  "Northern",
                  "Volta",
                  "Bono",
                  "Upper East",
                  "Upper West",
                ].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <div style={{ position: "relative", marginBottom: "15px" }}>
                <MapPin
                  size={18}
                  style={{
                    position: "absolute",
                    left: "15px",
                    top: "18px",
                    color: "#888",
                  }}
                />
                <input
                  placeholder="Address / Landmark..."
                  style={{ ...luxeInput, paddingLeft: "45px" }}
                  onChange={(e) =>
                    setDetails({ ...details, location: e.target.value })
                  }
                />
                <button
                  onClick={getLiveLocation}
                  style={{
                    ...gpsBtn,
                    background: geoLink ? "#4CAF50" : "#D4AF37",
                    color: geoLink ? "#fff" : "#000",
                  }}
                >
                  <Navigation size={14} />{" "}
                  {geoLink ? "GPS CAPTURED ✓" : "ADD LIVE GPS"}
                </button>
              </div>
              <div style={totalLine}>TOTAL: {formatGHS(cartTotal)}</div>

              {/* STEP-BY-STEP ADDITION: BUTTON ROW */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={downloadReceipt}
                  style={{
                    flex: "0.2",
                    padding: "15px",
                    background: "#f1f1f1",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  title="Download Receipt"
                >
                  <Download size={22} />
                </button>
                <button
                  onClick={sendOrderToManager}
                  style={{
                    flex: "0.8",
                    padding: "18px",
                    background: "#000",
                    color: "#D4AF37",
                    border: "none",
                    fontWeight: "900",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  COMPLETE ORDER
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// PRESERVED STYLES
const fixedGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "25px",
};
const luxuryCard = {
  background: "#fff",
  border: "1px solid #eee",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
};
const imgBox = { height: "350px", overflow: "hidden", position: "relative" };
const fixedImg = { width: "100%", height: "100%", objectFit: "cover" };
const cardInfo = { padding: "15px", textAlign: "center" };
const stylishName = {
  fontSize: "14px",
  fontWeight: "900",
  textTransform: "uppercase",
};
const heavyPrice = { fontSize: "18px", fontWeight: "900", color: "#D4AF37" };
const popOverlay = {
  position: "fixed",
  inset: 0,
  background: "#fff",
  zIndex: 5000,
  display: "flex",
  padding: "30px",
  overflowY: "auto",
};
const popContent = {
  width: "100%",
  maxWidth: "1200px",
  margin: "auto",
  position: "relative",
};
const popLayout = { display: "flex", gap: "40px", flexWrap: "wrap" };
const popImgBox = { flex: 1.2, minWidth: "300px" };
const fullImg = { width: "100%", height: "auto", objectFit: "contain" };
const popDetails = { flex: 0.8, minWidth: "300px" };
const popTitle = {
  fontFamily: "Playfair Display",
  fontSize: "32px",
  margin: "0",
};
const popPrice = {
  fontSize: "26px",
  fontWeight: "900",
  color: "#D4AF37",
  marginBottom: "15px",
};
const popDesc = { lineHeight: "1.6", color: "#333", marginBottom: "25px" };
const miniLab = { fontSize: "11px", fontWeight: "900", marginBottom: "8px" };
const qtyFlex = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid #000",
  padding: "8px",
};
const luxeSel = {
  width: "100%",
  padding: "12px",
  border: "1px solid #000",
  fontWeight: "bold",
};
const luxeAddBtn = {
  width: "100%",
  padding: "18px",
  background: "#000",
  color: "#fff",
  border: "none",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "16px",
};
const popClose = {
  position: "absolute",
  top: "-10px",
  right: "0",
  cursor: "pointer",
};
const successOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.9)",
  zIndex: 10000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const successCard = {
  background: "#fff",
  padding: "40px",
  borderRadius: "15px",
  textAlign: "center",
  maxWidth: "400px",
};
const completeBtn = {
  width: "100%",
  padding: "18px",
  background: "#000",
  color: "#D4AF37",
  border: "none",
  fontWeight: "900",
  cursor: "pointer",
  borderRadius: "5px",
};
const cartOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.8)",
  zIndex: 9999,
  display: "flex",
  justifyContent: "flex-end",
};
const cartSidebar = {
  width: "100%",
  maxWidth: "400px",
  background: "#fff",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
const sideHeader = {
  padding: "20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const cartItemStyle = {
  display: "flex",
  alignItems: "center",
  padding: "15px",
  borderBottom: "1px solid #f9f9f9",
};
const checkoutSection = {
  padding: "20px",
  background: "#fcfcfc",
  borderTop: "1px solid #eee",
};
const momoLuxeCard = {
  background: "#000",
  padding: "12px",
  borderRadius: "8px",
  color: "#fff",
  textAlign: "center",
  marginBottom: "15px",
};
const uploadMomo = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  background: "#fff",
  color: "#000",
  padding: "8px",
  borderRadius: "5px",
  marginTop: "8px",
  cursor: "pointer",
  fontWeight: "900",
  fontSize: "11px",
};
const luxeInput = {
  width: "100%",
  padding: "12px",
  border: "1px solid #ddd",
  marginBottom: "8px",
  borderRadius: "5px",
  boxSizing: "border-box",
};
const gpsBtn = {
  border: "none",
  padding: "6px 10px",
  borderRadius: "5px",
  fontSize: "9px",
  fontWeight: "900",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  marginTop: "5px",
};
const totalLine = {
  textAlign: "right",
  fontWeight: "900",
  fontSize: "20px",
  marginBottom: "15px",
  color: "#D4AF37",
};
const soldOutOverlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  color: "red",
};

export default Shop;
