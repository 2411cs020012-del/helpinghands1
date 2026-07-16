import React, { Component } from "react";
import ItemService from "../services/ItemService";
import UserService from "../services/UserService";
import RequestService from "../services/RequestService";

/* ─── Category → emoji mapping ───────────────────────────────── */
const CAT_EMOJI = {
  food: "🍱", Food: "🍱", FOOD: "🍱",
  clothes: "👗", Clothes: "👗", CLOTHES: "👗", clothing: "👗",
  books: "📚", Books: "📚", BOOKS: "📚",
  toys: "🧸", Toys: "🧸", TOYS: "🧸",
  furniture: "🪑", Furniture: "🪑", FURNITURE: "🪑",
  electronics: "📱", Electronics: "📱",
  medical: "💊", Medical: "💊",
};

function getCatEmoji(cat) {
  if (!cat) return "🎁";
  return CAT_EMOJI[cat] || CAT_EMOJI[cat.toLowerCase()] || "🎁";
}

/* ─── Status → pill class ─────────────────────────────────────── */
function pillClass(status) {
  const map = {
    AVAILABLE: "pill-available",
    RESERVED: "pill-reserved",
    DONATED: "pill-donated",
    UNAVAILABLE: "pill-unavailable",
    PENDING: "pill-pending",
    ACCEPTED: "pill-accepted",
    REJECTED: "pill-rejected",
    COMPLETED: "pill-completed",
  };
  return map[status] || "pill-unavailable";
}

/* ─── Animated Counter ────────────────────────────────────────── */
class AnimatedCounter extends Component {
  constructor(props) {
    super(props);
    this.state = { display: 0 };
    this.raf = null;
  }

  componentDidMount() { this.animate(0, this.props.value); }

  componentDidUpdate(prev) {
    if (prev.value !== this.props.value) {
      this.animate(this.state.display, this.props.value);
    }
  }

  animate(from, to) {
    if (this.raf) cancelAnimationFrame(this.raf);
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - elapsed, 3);
      this.setState({ display: Math.round(from + (to - from) * ease) });
      if (elapsed < 1) this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }

  render() {
    const { suffix = "" } = this.props;
    return <span>{this.state.display}{suffix}</span>;
  }
}

/* ─── Particle Canvas Background ──────────────────────────────── */
class ParticleBackground extends Component {
  componentDidMount() {
    const canvas = document.getElementById("hh-bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.05,
      color: Math.random() > 0.65
        ? `rgba(74,222,128,`
        : Math.random() > 0.5
          ? `rgba(96,165,250,`
          : `rgba(167,139,250,`,
    }));

    // Floating hearts / icons for motivation
    const floaters = Array.from({ length: 8 }, () => ({
      emoji: ["❤️", "🤝", "💚", "⭐", "🌟", "✨", "💫", "🌱"][Math.floor(Math.random() * 8)],
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 16 + 12,
      speed: Math.random() * 0.4 + 0.15,
      opacity: Math.random() * 0.12 + 0.04,
      driftX: (Math.random() - 0.5) * 0.2,
    }));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.014)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;
      }

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(74,222,128,${0.025 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating emojis
      for (const f of floaters) {
        ctx.save();
        ctx.globalAlpha = f.opacity;
        ctx.font = `${f.size}px serif`;
        ctx.fillText(f.emoji, f.x, f.y);
        ctx.restore();
        f.y -= f.speed;
        f.x += f.driftX;
        if (f.y < -30) { f.y = H + 30; f.x = Math.random() * W; }
      }

      frame = requestAnimationFrame(draw);
    };

    draw();
    this._cleanup = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }

  componentWillUnmount() { if (this._cleanup) this._cleanup(); }

  render() { return <canvas id="hh-bg-canvas" />; }
}

/* ─── Toast system ────────────────────────────────────────────── */
let _toastId = 0;

/* ─── Main Component ──────────────────────────────────────────── */
class ListItemComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      /* data */
      tab: "items",
      items: [],
      users: [],
      requests: [],
      /* auth */
      loggedInUser: null,
      loginEmail: "",
      loginError: "",
      /* donation form */
      showDonateModal: false,
      title: "", description: "", category: "",
      contactNumber: "", photoUrl: "", location: "",
      locationStatus: "",
      /* register form */
      userName: "", userEmail: "", userRole: "DONOR",
      /* search */
      searchQuery: "",
      filterCat: "ALL",
      /* toasts */
      toasts: [],
      /* loading */
      loadingItems: true,
      /* navbar scroll */
      scrolled: false,
    };
  }

  /* ── Lifecycle ──────────────────────────────────────────────── */
  componentDidMount() {
    this.loadAll();
    const saved = localStorage.getItem("hh_user");
    if (saved) this.setState({ loggedInUser: JSON.parse(saved) });
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    this.setState({ scrolled: window.scrollY > 20 });
  };

  loadAll = () => {
    this.setState({ loadingItems: true });
    Promise.all([
      ItemService.getAllItems(),
      UserService.getAllUsers(),
      RequestService.getAllRequests(),
    ]).then(([ir, ur, rr]) => {
      this.setState({
        items: ir.data,
        users: ur.data,
        requests: rr.data,
        loadingItems: false,
      });
    }).catch(() => {
      this.setState({ loadingItems: false });
      this.addToast("error", "Connection Error", "Could not reach the server. Please ensure the backend is running.");
    });
  };

  /* ── Toast helpers ──────────────────────────────────────────── */
  addToast = (type, title, msg) => {
    const id = ++_toastId;
    this.setState(s => ({ toasts: [...s.toasts, { id, type, title, msg, exit: false }] }));
    setTimeout(() => {
      this.setState(s => ({
        toasts: s.toasts.map(t => t.id === id ? { ...t, exit: true } : t),
      }));
      setTimeout(() => {
        this.setState(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      }, 300);
    }, 3800);
  };

  /* ── Data ops ───────────────────────────────────────────────── */
  deleteItemHandler = (id) => {
    ItemService.deleteItem(id).then(() => {
      this.setState(s => ({ items: s.items.filter(i => i.id !== id) }));
      this.addToast("success", "Item Removed", "The item has been deleted from the portal.");
    });
  };

  updateItemStatusHandler = (item, newStatus) => {
    ItemService.updateItem({ ...item, status: newStatus }, item.id).then(() => {
      this.setState(s => ({
        items: s.items.map(i => i.id === item.id ? { ...i, status: newStatus } : i),
      }));
      this.addToast("info", "Status Updated", `"${item.title}" is now ${newStatus.toLowerCase()}.`);
    });
  };

  openDonateModal = () => {
    this.setState({ showDonateModal: true, locationStatus: "" });
    if (navigator.geolocation) {
      this.setState({ locationStatus: "📍 Fetching your location…" });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          this.setState({ location: loc, locationStatus: "✅ Location captured automatically" });
        },
        () => this.setState({ locationStatus: "❌ Permission denied — enter manually." })
      );
    }
  };

  closeDonateModal = () => {
    this.setState({
      showDonateModal: false,
      title: "", description: "", category: "",
      contactNumber: "", photoUrl: "", location: "", locationStatus: "",
    });
  };

  saveItem = (e) => {
    e.preventDefault();
    const item = {
      title: this.state.title,
      description: this.state.description,
      category: this.state.category,
      status: "AVAILABLE",
      contactNumber: this.state.contactNumber,
      location: this.state.location,
      photoUrl: this.state.photoUrl,
    };
    ItemService.createItem(item).then((res) => {
      this.setState(s => ({
        items: [res.data, ...s.items],
        showDonateModal: false,
        title: "", description: "", category: "",
        contactNumber: "", photoUrl: "", location: "",
      }));
      this.addToast(
        "success",
        "Donation Live! 🎉",
        `"${item.title}" is now visible to people who need it. Thank you!`
      );
    }).catch(() => {
      this.addToast("error", "Failed", "Could not create the donation. Try again.");
    });
  };

  saveUser = (e) => {
    e.preventDefault();
    const user = {
      name: this.state.userName,
      email: this.state.userEmail,
      password: "changeme123",
      role: this.state.userRole,
    };
    UserService.createUser(user).then((res) => {
      this.setState(s => ({
        users: [...s.users, res.data],
        userName: "", userEmail: "",
      }));
      this.addToast("success", "Registered!", `${user.name} joined as ${user.role.toLowerCase()}.`);
    }).catch(() => {
      this.addToast("error", "Registration Failed", "Email may already be in use.");
    });
  };

  requestItemHandler = (item) => {
    if (!this.state.loggedInUser) {
      this.addToast("info", "Login Required", "Please log in before requesting an item.");
      this.setState({ tab: "login" });
      return;
    }
    RequestService.createRequest({
      itemId: item.id,
      recipientId: this.state.loggedInUser.id,
      status: "PENDING",
    }).then(() => {
      ItemService.getAllItems().then(r => this.setState({ items: r.data }));
      RequestService.getAllRequests().then(r => this.setState({ requests: r.data }));
      this.addToast("success", "Request Sent! 📬", `Your request for "${item.title}" is pending donor approval.`);
    }).catch(() => {
      this.addToast("error", "Failed", "Could not send the request. You may have already requested this item.");
    });
  };

  updateRequestHandler = (id, status, itemTitle) => {
    RequestService.updateRequestStatus(id, status).then(() => {
      RequestService.getAllRequests().then(r => this.setState({ requests: r.data }));
      ItemService.getAllItems().then(r => this.setState({ items: r.data }));
      const msgs = {
        ACCEPTED: ["Request Accepted ✅", "The recipient will be notified."],
        REJECTED: ["Request Rejected", "The request has been declined."],
        COMPLETED: ["Donation Complete! 🎊", "This item has been successfully donated!"],
      };
      const [title, msg] = msgs[status] || ["Updated", ""];
      this.addToast(status === "COMPLETED" ? "success" : "info", title, msg);
    });
  };

  loginHandler = (e) => {
    e.preventDefault();
    const found = this.state.users.find(u => u.email === this.state.loginEmail);
    if (!found) {
      this.setState({ loginError: "No account found with that email. Register first." });
      return;
    }
    localStorage.setItem("hh_user", JSON.stringify(found));
    this.setState({ loggedInUser: found, loginError: "", loginEmail: "", tab: "items" });
    this.addToast("success", `Welcome back, ${found.name.split(" ")[0]}! 👋`, `Logged in as ${found.role.toLowerCase()}.`);
  };

  logoutHandler = () => {
    const name = this.state.loggedInUser?.name?.split(" ")[0];
    localStorage.removeItem("hh_user");
    this.setState({ loggedInUser: null, tab: "items" });
    this.addToast("info", "Logged Out", `See you soon, ${name}!`);
  };

  /* ── Derived data ────────────────────────────────────────────── */
  getFilteredItems() {
    const { items, searchQuery, filterCat } = this.state;
    return items.filter(item => {
      const matchSearch = !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCat === "ALL" || item.category?.toUpperCase() === filterCat;
      return matchSearch && matchCat;
    });
  }

  getCategories() {
    const cats = new Set(this.state.items.map(i => i.category).filter(Boolean));
    return Array.from(cats);
  }

  /* ── Render helpers ─────────────────────────────────────────── */
  renderToasts() {
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    return (
      <div className="hh-toasts">
        {this.state.toasts.map(t => (
          <div key={t.id} className={`hh-toast ${t.type} ${t.exit ? "exit" : ""}`}>
            <div className="hh-toast-ico">{icons[t.type]}</div>
            <div>
              <div className="hh-toast-title">{t.title}</div>
              {t.msg && <div className="hh-toast-msg">{t.msg}</div>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  renderDonateModal() {
    if (!this.state.showDonateModal) return null;
    const { title, description, category, contactNumber, photoUrl, location, locationStatus } = this.state;
    return (
      <div className="hh-overlay" onClick={(e) => e.target === e.currentTarget && this.closeDonateModal()}>
        <div className="hh-modal">
          <div className="hh-modal-head">
            <div>
              <div className="hh-modal-title">🎁 Create a Donation</div>
              <div className="hh-modal-sub">Your generosity makes a real difference.</div>
            </div>
            <button className="hh-modal-close" onClick={this.closeDonateModal}>✕</button>
          </div>
          <div className="hh-modal-body">
            <form onSubmit={this.saveItem} className="hh-form">
              <div className="hh-form-row">
                <div className="hh-field">
                  <label className="hh-label">Title <span className="req">*</span></label>
                  <input
                    className="hh-input"
                    placeholder="e.g., Winter Jacket (Size M)"
                    value={title}
                    onChange={e => this.setState({ title: e.target.value })}
                    required
                  />
                </div>
                <div className="hh-field">
                  <label className="hh-label">Category</label>
                  <select
                    className="hh-select"
                    value={category}
                    onChange={e => this.setState({ category: e.target.value })}
                  >
                    <option value="">Select category…</option>
                    <option value="Food">🍱 Food</option>
                    <option value="Clothes">👗 Clothes</option>
                    <option value="Books">📚 Books</option>
                    <option value="Toys">🧸 Toys</option>
                    <option value="Furniture">🪑 Furniture</option>
                    <option value="Electronics">📱 Electronics</option>
                    <option value="Medical">💊 Medical</option>
                    <option value="Other">🎁 Other</option>
                  </select>
                </div>
              </div>
              <div className="hh-field">
                <label className="hh-label">Description</label>
                <textarea
                  className="hh-textarea"
                  placeholder="Describe the item — condition, size, quantity, etc."
                  value={description}
                  onChange={e => this.setState({ description: e.target.value })}
                />
              </div>
              <div className="hh-form-row">
                <div className="hh-field">
                  <label className="hh-label">Contact Number <span className="req">*</span></label>
                  <input
                    className="hh-input"
                    placeholder="+91 98765 43210"
                    value={contactNumber}
                    onChange={e => this.setState({ contactNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="hh-field">
                  <label className="hh-label">Location</label>
                  <input
                    className="hh-input"
                    placeholder="City, Area"
                    value={location}
                    onChange={e => this.setState({ location: e.target.value })}
                  />
                </div>
              </div>
              {locationStatus && (
                <div className="hh-field-hint">{locationStatus}</div>
              )}
              <div className="hh-field">
                <label className="hh-label">Photo URL <span style={{ color: "var(--txt-dim)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="hh-input"
                  placeholder="https://example.com/photo.jpg"
                  value={photoUrl}
                  onChange={e => this.setState({ photoUrl: e.target.value })}
                />
              </div>
              <div className="hh-modal-footer" style={{ padding: "16px 0 0" }}>
                <button type="button" className="btn btn-ghost" onClick={this.closeDonateModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">🎁 Submit Donation</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  renderItemsTab() {
    const { loggedInUser, searchQuery, filterCat, loadingItems } = this.state;
    const isAdmin = loggedInUser?.role === "ADMIN";
    const filtered = this.getFilteredItems();
    const categories = this.getCategories();

    return (
      <div>
        {/* Impact banner */}
        <div className="hh-impact-bar">
          <div className="hh-impact-text">
            <h3>🌟 Every donation transforms a life</h3>
            <p>Your unused items can bring joy, warmth, and hope to someone in need. Be the change.</p>
          </div>
          <button className="btn btn-primary-xl" onClick={this.openDonateModal}>
            🎁 Donate an Item
          </button>
        </div>

        {/* Search + filter */}
        <div className="hh-filter-bar">
          <div className="hh-search-wrap">
            <span className="hh-search-ico">🔍</span>
            <input
              placeholder="Search items by title, category, description…"
              value={searchQuery}
              onChange={e => this.setState({ searchQuery: e.target.value })}
            />
          </div>
          <button
            className={`hh-chip ${filterCat === "ALL" ? "active" : ""}`}
            onClick={() => this.setState({ filterCat: "ALL" })}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`hh-chip ${filterCat === cat.toUpperCase() ? "active" : ""}`}
              onClick={() => this.setState({ filterCat: cat.toUpperCase() })}
            >
              {getCatEmoji(cat)} {cat}
            </button>
          ))}
        </div>

        {loadingItems ? (
          <div className="hh-empty">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <div className="hh-empty-sub" style={{ marginTop: 12 }}>Loading donations…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="hh-empty">
            <div className="hh-empty-ico">📦</div>
            <div className="hh-empty-title">No donations found</div>
            <div className="hh-empty-sub">
              {searchQuery
                ? "Try a different search term or clear filters."
                : "Be the first to make a difference — donate an item!"}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={this.openDonateModal}>
              🎁 Donate First
            </button>
          </div>
        ) : (
          <div className="hh-items-grid">
            {filtered.map(item => this.renderItemCard(item, isAdmin, loggedInUser))}
          </div>
        )}
      </div>
    );
  }

  renderItemCard(item, isAdmin, loggedInUser) {
    const canRequest = !loggedInUser || loggedInUser.role === "RECIPIENT";
    const isAvailable = item.status === "AVAILABLE";
    const emoji = getCatEmoji(item.category);

    return (
      <div key={item.id} className="hh-item-card">
        <div className="hh-item-media">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.title} onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div className="hh-item-media-placeholder">{emoji}</div>
          )}
          {item.category && (
            <span className="hh-item-cat-tag">{emoji} {item.category}</span>
          )}
        </div>
        <div className="hh-item-body">
          <div className="hh-item-title">{item.title}</div>
          {item.description && (
            <div className="hh-item-desc">{item.description}</div>
          )}
          <div className="hh-item-meta">
            {item.location && (
              <div className="hh-meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {item.location}
              </div>
            )}
            {item.contactNumber && (
              <div className="hh-meta-row">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 13a19.79 19.79 0 01-3.07-8.67A2 2 0 012 2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 9.91a16 16 0 006.91 6.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {item.contactNumber}
              </div>
            )}
          </div>
        </div>
        <div className="hh-item-footer">
          <span className={`status-pill ${pillClass(item.status)}`}>{item.status}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {canRequest && isAvailable && (
              <button
                className="btn btn-blue btn-sm"
                onClick={() => this.requestItemHandler(item)}
              >
                📬 Request
              </button>
            )}
            {isAdmin && (
              <>
                <select
                  value={item.status}
                  onChange={e => this.updateItemStatusHandler(item, e.target.value)}
                  style={{
                    background: "var(--clr-surface-2)",
                    color: "var(--txt-secondary)",
                    border: "1px solid var(--clr-border)",
                    borderRadius: "var(--r-sm)",
                    padding: "4px 8px",
                    fontSize: "12px",
                    fontFamily: "var(--font-sans)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="DONATED">Donated</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => this.deleteItemHandler(item.id)}
                >
                  🗑️
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderUsersTab() {
    const { users, userName, userEmail, userRole, loggedInUser } = this.state;
    const isAdmin = loggedInUser?.role === "ADMIN";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Register card */}
        <div className="hh-panel">
          <div className="hh-panel-head">
            <div>
              <div className="hh-panel-title">👤 Join the Community</div>
              <div className="hh-panel-sub">Register as a donor or recipient to get started.</div>
            </div>
          </div>
          <form onSubmit={this.saveUser} className="hh-form">
            <div className="hh-form-row">
              <div className="hh-field">
                <label className="hh-label">Full Name <span className="req">*</span></label>
                <input
                  className="hh-input"
                  placeholder="Jane Smith"
                  value={userName}
                  onChange={e => this.setState({ userName: e.target.value })}
                  required
                />
              </div>
              <div className="hh-field">
                <label className="hh-label">Email Address <span className="req">*</span></label>
                <input
                  className="hh-input"
                  type="email"
                  placeholder="jane@example.com"
                  value={userEmail}
                  onChange={e => this.setState({ userEmail: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="hh-field" style={{ maxWidth: 240 }}>
              <label className="hh-label">Role</label>
              <select
                className="hh-select"
                value={userRole}
                onChange={e => this.setState({ userRole: e.target.value })}
              >
                <option value="DONOR">🎁 Donor — I want to give</option>
                <option value="RECIPIENT">🤲 Recipient — I need help</option>
              </select>
            </div>
            <div>
              <button type="submit" className="btn btn-primary">✓ Register Account</button>
            </div>
          </form>
        </div>

        {/* Users grid */}
        <div className="hh-panel">
          <div className="hh-panel-head">
            <div>
              <div className="hh-panel-title">🌍 Our Community</div>
              <div className="hh-panel-sub">{users.length} member{users.length !== 1 ? "s" : ""} making a difference</div>
            </div>
          </div>
          {users.length === 0 ? (
            <div className="hh-empty">
              <div className="hh-empty-ico">👥</div>
              <div className="hh-empty-title">No members yet</div>
              <div className="hh-empty-sub">Be the first to join the community!</div>
            </div>
          ) : (
            <div className="hh-user-grid">
              {users.map((u, i) => {
                const initials = u.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
                const roleClass = u.role?.toLowerCase() || "donor";
                return (
                  <div
                    key={u.id}
                    className={`hh-user-card ${roleClass}`}
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="card-glow" />
                    <div className={`hh-user-ava ${roleClass}`}>{initials}</div>
                    <div className="hh-user-info">
                      <div className="hh-user-name">{u.name}</div>
                      {isAdmin && <div className="hh-user-email">{u.email}</div>}
                      <span className={`hh-role-chip ${roleClass}`}>{u.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  renderRequestsTab() {
    const { requests, users, items, loggedInUser } = this.state;
    const isAdmin = loggedInUser?.role === "ADMIN";

    const getUserName = (id) => {
      const u = users.find(u => u.id === id || String(u.id) === String(id));
      return u ? u.name : `#${id}`;
    };

    const getItemTitle = (id) => {
      const it = items.find(i => i.id === id || String(i.id) === String(id));
      return it ? it.title : `Item #${id}`;
    };

    // Filter for non-admins: show only own requests
    const visibleReqs = isAdmin
      ? requests
      : loggedInUser
        ? requests.filter(r => String(r.recipientId) === String(loggedInUser.id))
        : [];

    return (
      <div className="hh-panel">
        <div className="hh-panel-head">
          <div>
            <div className="hh-panel-title">📋 {isAdmin ? "All Requests" : "My Requests"}</div>
            <div className="hh-panel-sub">
              {isAdmin
                ? "Manage donation requests — accept, reject, or mark completed."
                : "Track the status of items you've requested."}
            </div>
          </div>
          <span className={`status-pill pill-available`} style={{ alignSelf: "flex-start" }}>
            {visibleReqs.length} request{visibleReqs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {!loggedInUser && !isAdmin ? (
          <div className="hh-empty">
            <div className="hh-empty-ico">🔒</div>
            <div className="hh-empty-title">Login Required</div>
            <div className="hh-empty-sub">Please log in to view your requests.</div>
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => this.setState({ tab: "login" })}>
              Go to Login
            </button>
          </div>
        ) : visibleReqs.length === 0 ? (
          <div className="hh-empty">
            <div className="hh-empty-ico">📬</div>
            <div className="hh-empty-title">No requests yet</div>
            <div className="hh-empty-sub">
              {isAdmin ? "No donation requests have been made yet." : "Browse available items and request something you need!"}
            </div>
          </div>
        ) : (
          <div className="hh-table-wrap">
            <table className="hh-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  {isAdmin && <th>Recipient</th>}
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visibleReqs.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--txt-dim)", fontSize: 12 }}>{i + 1}</td>
                    <td style={{ color: "var(--txt-primary)", fontWeight: 600 }}>{getItemTitle(r.itemId)}</td>
                    {isAdmin && <td>{getUserName(r.recipientId)}</td>}
                    <td>
                      <span className={`status-pill ${pillClass(r.status)}`}>{r.status}</span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {r.status === "PENDING" && (
                            <>
                              <button className="btn btn-blue btn-sm" onClick={() => this.updateRequestHandler(r.id, "ACCEPTED", getItemTitle(r.itemId))}>
                                ✓ Accept
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => this.updateRequestHandler(r.id, "REJECTED", getItemTitle(r.itemId))}>
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {r.status === "ACCEPTED" && (
                            <button className="btn btn-primary btn-sm" onClick={() => this.updateRequestHandler(r.id, "COMPLETED", getItemTitle(r.itemId))}>
                              🎊 Complete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  renderLoginTab() {
    const { loginEmail, loginError, loggedInUser } = this.state;

    if (loggedInUser) {
      return (
        <div className="hh-login-wrap">
          <div className="hh-login-card">
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--clr-green-400), var(--clr-green-600))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 20px",
                boxShadow: "0 0 32px rgba(74,222,128,0.4)",
              }}>
                {loggedInUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hh-login-title">{loggedInUser.name}</div>
              <div className="hh-login-sub">{loggedInUser.email}</div>
              <span className={`hh-role-chip ${loggedInUser.role?.toLowerCase()}`} style={{ display: "inline-flex", marginBottom: 28 }}>
                {loggedInUser.role}
              </span>
              <div>
                <button className="btn btn-danger" onClick={this.logoutHandler} style={{ width: "100%" }}>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hh-login-wrap">
        <div className="hh-login-card">
          <div className="hh-login-icon">H</div>
          <div className="hh-login-title">Welcome back</div>
          <div className="hh-login-sub">Sign in to request items or manage donations.</div>
          <form onSubmit={this.loginHandler} className="hh-form">
            <div className="hh-field">
              <label className="hh-label">Email Address <span className="req">*</span></label>
              <input
                className="hh-input"
                type="email"
                placeholder="your@email.com"
                value={loginEmail}
                onChange={e => this.setState({ loginEmail: e.target.value, loginError: "" })}
                required
              />
            </div>
            {loginError && (
              <div className="hh-error-msg">⚠️ {loginError}</div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Sign In →
            </button>
          </form>
          <div className="hh-divider" />
          <p style={{ fontSize: 13, color: "var(--txt-muted)", textAlign: "center", lineHeight: 1.6 }}>
            Don't have an account?{" "}
            <span
              style={{ color: "var(--clr-green-400)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => this.setState({ tab: "users" })}
            >
              Register in the Users tab
            </span>
            . Pick <strong style={{ color: "var(--txt-secondary)" }}>ADMIN</strong> role to get admin access.
          </p>
        </div>
      </div>
    );
  }

  renderAdminTab() {
    const { items, users, requests, loggedInUser } = this.state;
    const isAdmin = loggedInUser?.role === "ADMIN";
    if (!isAdmin) return null;

    const byStatus = (s) => items.filter(i => i.status === s).length;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Metrics */}
        <div className="hh-metrics-grid">
          {[
            { ico: "📦", num: items.length, lbl: "Total Items", color: "var(--clr-blue-400)" },
            { ico: "✅", num: byStatus("AVAILABLE"), lbl: "Available", color: "var(--clr-green-400)" },
            { ico: "🏷️", num: byStatus("RESERVED"), lbl: "Reserved", color: "var(--clr-amber-400)" },
            { ico: "🎊", num: byStatus("DONATED"), lbl: "Donated", color: "var(--clr-purple-400)" },
            { ico: "👥", num: users.length, lbl: "Users", color: "var(--clr-blue-400)" },
            { ico: "📋", num: requests.length, lbl: "Requests", color: "var(--clr-amber-400)" },
            { ico: "⭐", num: requests.filter(r => r.status === "COMPLETED").length, lbl: "Completed", color: "var(--clr-green-400)" },
            { ico: "⏳", num: requests.filter(r => r.status === "PENDING").length, lbl: "Pending", color: "var(--clr-red-400)" },
          ].map(m => (
            <div key={m.lbl} className="hh-metric-card">
              <div className="hh-metric-ico">{m.ico}</div>
              <div className="hh-metric-num" style={{ color: m.color }}>{m.num}</div>
              <div className="hh-metric-lbl">{m.lbl}</div>
            </div>
          ))}
        </div>

        {/* Items table */}
        <div className="hh-panel">
          <div className="hh-panel-head">
            <div>
              <div className="hh-panel-title">📦 All Items ({items.length})</div>
              <div className="hh-panel-sub">Manage item statuses and remove listings.</div>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="hh-empty">
              <div className="hh-empty-ico">📦</div>
              <div className="hh-empty-title">No items yet</div>
            </div>
          ) : (
            <div className="hh-table-wrap">
              <table className="hh-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ color: "var(--txt-primary)", fontWeight: 600 }}>{item.title}</td>
                      <td>{item.category ? `${getCatEmoji(item.category)} ${item.category}` : "—"}</td>
                      <td>{item.location || "—"}</td>
                      <td>
                        <select
                          value={item.status}
                          onChange={e => this.updateItemStatusHandler(item, e.target.value)}
                          style={{
                            background: "var(--clr-surface-2)",
                            color: "var(--txt-secondary)",
                            border: "1px solid var(--clr-border)",
                            borderRadius: "var(--r-sm)",
                            padding: "4px 8px",
                            fontSize: "12px",
                            fontFamily: "var(--font-sans)",
                            cursor: "pointer",
                            outline: "none",
                          }}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RESERVED">Reserved</option>
                          <option value="DONATED">Donated</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => this.deleteItemHandler(item.id)}>
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users table */}
        <div className="hh-panel">
          <div className="hh-panel-head">
            <div>
              <div className="hh-panel-title">👥 All Users ({users.length})</div>
              <div className="hh-panel-sub">Registered members of the portal.</div>
            </div>
          </div>
          {users.length === 0 ? (
            <div className="hh-empty">
              <div className="hh-empty-ico">👥</div>
              <div className="hh-empty-title">No users yet</div>
            </div>
          ) : (
            <div className="hh-table-wrap">
              <table className="hh-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ color: "var(--txt-primary)", fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`hh-role-chip ${u.role?.toLowerCase()}`}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────────── */
  render() {
    const { tab, items, users, requests, loggedInUser, scrolled } = this.state;
    const isAdmin = loggedInUser?.role === "ADMIN";

    const pendingCount = requests.filter(r => r.status === "PENDING").length;
    const myRequestCount = loggedInUser
      ? requests.filter(r => String(r.recipientId) === String(loggedInUser.id)).length
      : 0;

    const statsData = [
      { num: items.length, label: "Items Available", color: "green" },
      { num: users.filter(u => u.role === "DONOR").length, label: "Generous Donors", color: "blue" },
      { num: requests.filter(r => r.status === "COMPLETED").length, label: "Lives Touched", color: "purple" },
      { num: requests.length, label: "Total Requests", color: "amber" },
    ];

    const userInitials = loggedInUser
      ? loggedInUser.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()
      : null;

    return (
      <div className="hh-app">
        <ParticleBackground />

        {/* Navbar */}
        <nav className={`hh-navbar ${scrolled ? "scrolled" : ""}`}>
          <div className="hh-brand">
            <div className="hh-brand-icon">H</div>
            <div>
              <div className="hh-brand-name">HelpingHands</div>
              <div className="hh-brand-tagline">Donation Portal</div>
            </div>
          </div>
          <div className="hh-navbar-right">
            <div className="hh-live-indicator">
              <span className="hh-live-dot" />
              <span>Live</span>
            </div>
            {loggedInUser ? (
              <button className="hh-auth-btn logged-in" onClick={this.logoutHandler}>
                <div className="user-avatar-sm">{userInitials}</div>
                {loggedInUser.name.split(" ")[0]} · Sign Out
              </button>
            ) : (
              <button className="hh-auth-btn" onClick={() => this.setState({ tab: "login" })}>
                🔐 Sign In
              </button>
            )}
          </div>
        </nav>

        {/* Hero */}
        <section className="hh-hero">
          <div className="hh-hero-orb o1" />
          <div className="hh-hero-orb o2" />
          <div className="hh-hero-orb o3" />
          <div className="hh-hero-content">
            <div className="hh-hero-badge">
              <span>🌱</span>
              <span>Community Donation Platform</span>
            </div>
            <h1 className="hh-hero-title">
              Turn Generosity into{" "}
              <span className="accent">Real Impact</span>
            </h1>
            <p className="hh-hero-subtitle">
              HelpingHands bridges the gap between donors with items to give
              and recipients who need them — through a transparent, trackable,
              and deeply human process.
            </p>
            <div className="hh-hero-cta">
              <button className="btn btn-primary-xl" onClick={this.openDonateModal}>
                🎁 Donate an Item
              </button>
              <button className="btn btn-ghost" style={{ fontSize: 15 }} onClick={() => this.setState({ tab: "items" })}>
                Browse Donations →
              </button>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="hh-stats-bar">
          {statsData.map(s => (
            <div key={s.label} className="hh-stat-cell">
              <div className={`hh-stat-num ${s.color}`}>
                <AnimatedCounter value={s.num} />
              </div>
              <div className="hh-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <main className="hh-main">
          {/* Tabs */}
          <div className="hh-tabs-row">
            <div className="hh-tabs">
              {[
                { id: "items", label: "Donations", icon: "📦", count: items.length },
                { id: "users", label: "Community", icon: "👥", count: users.length },
                {
                  id: "requests", label: isAdmin ? "Requests" : "My Requests", icon: "📋",
                  count: isAdmin ? pendingCount : myRequestCount, highlight: isAdmin && pendingCount > 0
                },
                { id: "login", label: loggedInUser ? "Account" : "Sign In", icon: "🔐" },
                ...(isAdmin ? [{ id: "admin", label: "Admin", icon: "⚙️", adminTab: true }] : []),
              ].map(t => (
                <button
                  key={t.id}
                  className={`hh-tab ${tab === t.id ? "active" : ""} ${t.adminTab ? "admin-tab" : ""}`}
                  onClick={() => this.setState({ tab: t.id })}
                >
                  <span className="tab-icon">{t.icon}</span>
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="tab-count">{t.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {tab === "items"    && this.renderItemsTab()}
          {tab === "users"    && this.renderUsersTab()}
          {tab === "requests" && this.renderRequestsTab()}
          {tab === "login"    && this.renderLoginTab()}
          {tab === "admin"    && this.renderAdminTab()}
        </main>

        {/* Footer */}
        <footer className="hh-footer">
          <div className="hh-footer-brand">
            <div className="hh-footer-brand-ico">H</div>
            <span style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--txt-secondary)" }}>
              HelpingHands
            </span>
          </div>
          <div className="hh-footer-copy">
            Built with <span>❤️</span> for humanity · © {new Date().getFullYear()} HelpingHands Donation Portal
          </div>
        </footer>

        {/* Donate modal */}
        {this.renderDonateModal()}

        {/* Toasts */}
        {this.renderToasts()}
      </div>
    );
  }
}

export default ListItemComponent;