import React, { Component } from "react";
import ItemService from "../services/ItemService";
import UserService from "../services/UserService";
import RequestService from "../services/RequestService";

class ListItemComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "items",
      items: [],
      users: [],
      requests: [],
      showAdd: false,
      title: "", description: "", category: "", contactNumber: "", photoUrl: "", location: "", locationStatus: "",
      userName: "", userEmail: "", userRole: "DONOR",
      thankYouMsg: "",
      loggedInUser: null,
      loginEmail: "",
      loginError: "",
    };
  }

  componentDidMount() {
    this.loadItems();
    this.loadUsers();
    this.loadRequests();
    const saved = localStorage.getItem("hh_user");
    if (saved) this.setState({ loggedInUser: JSON.parse(saved) });
  }

  loadItems = () => ItemService.getAllItems().then((res) => this.setState({ items: res.data }));
  loadUsers = () => UserService.getAllUsers().then((res) => this.setState({ users: res.data }));
  loadRequests = () => RequestService.getAllRequests().then((res) => this.setState({ requests: res.data }));

  deleteItemHandler = (id) => {
    ItemService.deleteItem(id).then(() => {
      this.setState({ items: this.state.items.filter((item) => item.id !== id) });
    });
  };

  openAddForm = () => {
    this.setState({ showAdd: !this.state.showAdd, locationStatus: "" });
    if (!this.state.showAdd && navigator.geolocation) {
      this.setState({ locationStatus: "Fetching your location..." });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          this.setState({ location: loc, locationStatus: "Location captured ?" });
        },
        () => this.setState({ locationStatus: "Location permission denied ? type it manually." })
      );
    }
  };

  saveItem = (e) => {
    e.preventDefault();
    const item = {
      title: this.state.title, description: this.state.description, category: this.state.category,
      status: "AVAILABLE", contactNumber: this.state.contactNumber, location: this.state.location, photoUrl: this.state.photoUrl,
    };
    ItemService.createItem(item).then(() => {
      this.setState({
        title: "", description: "", category: "", contactNumber: "", photoUrl: "", location: "", showAdd: false,
        thankYouMsg: `?? Thank you! Your donation is now live and visible to people in need.`,
      });
      this.loadItems();
      setTimeout(() => this.setState({ thankYouMsg: "" }), 5000);
    });
  };

  saveUser = (e) => {
    e.preventDefault();
    const user = { name: this.state.userName, email: this.state.userEmail, password: "changeme123", role: this.state.userRole };
    UserService.createUser(user).then(() => {
      this.setState({ userName: "", userEmail: "" });
      this.loadUsers();
    });
  };

  requestItemHandler = (itemId) => {
    if (!this.state.loggedInUser) {
      alert("Please log in first (Login tab) before requesting an item.");
      return;
    }
    RequestService.createRequest({ itemId, recipientId: this.state.loggedInUser.id, status: "PENDING" }).then(() => {
      this.loadRequests();
      alert("Request sent! The donor will be notified.");
    });
  };

  updateRequestHandler = (id, status) => {
    RequestService.updateRequestStatus(id, status).then(() => {
      this.loadRequests();
      this.loadItems();
    });
  };

  loginHandler = (e) => {
    e.preventDefault();
    const found = this.state.users.find((u) => u.email === this.state.loginEmail);
    if (!found) {
      this.setState({ loginError: "No user found with that email. Register first." });
      return;
    }
    localStorage.setItem("hh_user", JSON.stringify(found));
    this.setState({ loggedInUser: found, loginError: "", loginEmail: "" });
  };

  logoutHandler = () => {
    localStorage.removeItem("hh_user");
    this.setState({ loggedInUser: null, tab: "items" });
  };

  render() {
    const { tab, loggedInUser } = this.state;
    const isAdmin = loggedInUser && loggedInUser.role === "ADMIN";
    const inputStyle = { width: "100%", padding: 12, marginBottom: 14, background: "#0b1220", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0" };

    return (
      <div>
        <div className="app-header">
          <div className="brand">
            <div className="brand-logo">H</div>
            <div className="brand-text"><h1>HELPINGHANDS</h1><p>Donation Portal</p></div>
          </div>
          <div>
            {loggedInUser ? (
              <span className="user-badge" style={{ cursor: "pointer" }} onClick={this.logoutHandler}>
                {loggedInUser.name} ({loggedInUser.role}) ? Logout
              </span>
            ) : (
              <span className="user-badge" style={{ cursor: "pointer" }} onClick={() => this.setState({ tab: "login" })}>
                Not logged in ? Login
              </span>
            )}
          </div>
        </div>

        <div className="hero">
          <h2>Turn extra items into <span>real impact</span> for people in need.</h2>
          <p>HelpingHands connects donors who have items to give with recipients who need them, through a simple, trackable process.</p>
        </div>

        <div className="container-main">
          <div className="tabs">
            <div className={`tab ${tab === "items" ? "active" : ""}`} onClick={() => this.setState({ tab: "items" })}>Items</div>
            <div className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => this.setState({ tab: "users" })}>Users</div>
            <div className={`tab ${tab === "requests" ? "active" : ""}`} onClick={() => this.setState({ tab: "requests" })}>My Requests</div>
            <div className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => this.setState({ tab: "login" })}>Login</div>
            {isAdmin && <div className={`tab ${tab === "admin" ? "active" : ""}`} onClick={() => this.setState({ tab: "admin" })}>Admin</div>}
          </div>

          {this.state.thankYouMsg && <div className="panel" style={{ marginBottom: 20, borderColor: "#4ade80" }}>{this.state.thankYouMsg}</div>}

          {tab === "login" && (
            <div className="panel" style={{ maxWidth: 420 }}>
              <h3>Login</h3>
              <p className="subtext">Enter the email you registered with (demo login ? no password check).</p>
              <form onSubmit={this.loginHandler}>
                <input style={inputStyle} placeholder="Your registered email" value={this.state.loginEmail} onChange={(e) => this.setState({ loginEmail: e.target.value })} required />
                <button className="add-item-btn" type="submit">Login</button>
              </form>
              {this.state.loginError && <p style={{ color: "#ef4444" }}>{this.state.loginError}</p>}
              <p className="subtext" style={{ marginTop: 16 }}>No account? Register in the Users tab first ? pick role ADMIN to get admin access.</p>
            </div>
          )}

          {tab === "items" && (
            <div>
              <button className="add-item-btn" onClick={this.openAddForm}>{this.state.showAdd ? "Cancel" : "+ Donate an Item"}</button>
              {this.state.showAdd && (
                <div className="panel form-panel" style={{ marginBottom: 30, maxWidth: 420 }}>
                  <h3>Create new donation</h3>
                  <form onSubmit={this.saveItem}>
                    <input style={inputStyle} placeholder="Title" value={this.state.title} onChange={(e) => this.setState({ title: e.target.value })} required />
                    <input style={inputStyle} placeholder="Description" value={this.state.description} onChange={(e) => this.setState({ description: e.target.value })} />
                    <input style={inputStyle} placeholder="Category" value={this.state.category} onChange={(e) => this.setState({ category: e.target.value })} />
                    <input style={inputStyle} placeholder="Contact number" value={this.state.contactNumber} onChange={(e) => this.setState({ contactNumber: e.target.value })} required />
                    <input style={inputStyle} placeholder="Photo URL (optional)" value={this.state.photoUrl} onChange={(e) => this.setState({ photoUrl: e.target.value })} />
                    <input style={inputStyle} placeholder="Location" value={this.state.location} onChange={(e) => this.setState({ location: e.target.value })} />
                    {this.state.locationStatus && <p className="subtext">{this.state.locationStatus}</p>}
                    <button className="add-item-btn" type="submit">Submit Donation</button>
                  </form>
                </div>
              )}
              <div className="panel">
                <h3>Available items</h3>
                <p className="subtext">Live donations currently in the system.</p>
                {this.state.items.length === 0 ? <div className="empty-state">No items donated yet. Be the first!</div> : (
                  <table className="item-table">
                    <thead><tr><th>Item</th><th>Category</th><th>Location</th><th>Contact</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                      {this.state.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>{item.category}</td>
                          <td>{item.location || "?"}</td>
                          <td>{item.contactNumber || "?"}</td>
                          <td><span className="status-pill status-available">{item.status}</span></td>
                          <td>
                            <button className="request-btn" onClick={() => this.requestItemHandler(item.id)}>Request</button>
                            <button className="remove-btn" onClick={() => this.deleteItemHandler(item.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="panel">
              <h3>Register a User</h3>
              <p className="subtext">Sign up as a Donor, Recipient, or Admin.</p>
              <div className="form-panel" style={{ maxWidth: 420, marginBottom: 30 }}>
                <form onSubmit={this.saveUser}>
                  <input style={inputStyle} placeholder="Full name" value={this.state.userName} onChange={(e) => this.setState({ userName: e.target.value })} required />
                  <input style={inputStyle} placeholder="Email" value={this.state.userEmail} onChange={(e) => this.setState({ userEmail: e.target.value })} required />
                  <select style={inputStyle} value={this.state.userRole} onChange={(e) => this.setState({ userRole: e.target.value })}>
                    <option value="DONOR">Donor</option>
                    <option value="RECIPIENT">Recipient</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button className="add-item-btn" type="submit">Register</button>
                </form>
              </div>
              <h3>Registered Users</h3>
              {this.state.users.length === 0 ? <div className="empty-state">No users yet.</div> : (
                this.state.users.map((u) => (
                  <div key={u.id} style={{ marginBottom: 8 }}><span className="user-badge">{u.role}</span> {u.name} ({u.email})</div>
                ))
              )}
            </div>
          )}

          {tab === "requests" && (
            <div className="panel">
              <h3>All Requests</h3>
              <p className="subtext">Items requested by recipients. {isAdmin && "As admin, you can accept/reject/complete."}</p>
              {this.state.requests.length === 0 ? <div className="empty-state">No requests yet.</div> : (
                <table className="item-table">
                  <thead><tr><th>Item ID</th><th>Recipient ID</th><th>Status</th>{isAdmin && <th>Action</th>}</tr></thead>
                  <tbody>
                    {this.state.requests.map((r) => (
                      <tr key={r.id}>
                        <td>{r.itemId}</td>
                        <td>{r.recipientId}</td>
                        <td><span className="status-pill status-available">{r.status}</span></td>
                        {isAdmin && (
                          <td>
                            {r.status === "PENDING" && (
                              <>
                                <button className="request-btn" onClick={() => this.updateRequestHandler(r.id, "ACCEPTED")}>Accept</button>
                                <button className="remove-btn" onClick={() => this.updateRequestHandler(r.id, "REJECTED")}>Reject</button>
                              </>
                            )}
                            {r.status === "ACCEPTED" && (
                              <button className="request-btn" onClick={() => this.updateRequestHandler(r.id, "COMPLETED")}>Mark Completed</button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "admin" && isAdmin && (
            <div className="panel">
              <h3>Admin Console</h3>
              <p className="subtext">Manage all items, users and requests.</p>
              <h3 style={{ marginTop: 24 }}>All Items ({this.state.items.length})</h3>
              <table className="item-table">
                <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {this.state.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td><td>{item.category}</td>
                      <td><span className="status-pill status-available">{item.status}</span></td>
                      <td><button className="remove-btn" onClick={() => this.deleteItemHandler(item.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h3 style={{ marginTop: 24 }}>All Users ({this.state.users.length})</h3>
              {this.state.users.map((u) => <div key={u.id} style={{ marginBottom: 8 }}><span className="user-badge">{u.role}</span> {u.name} ({u.email})</div>)}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ListItemComponent;
