import React, { Component } from "react";
import ItemService from "../services/ItemService";

class ListItemComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { items: [], showAdd: false, title: "", description: "", category: "" };
  }

  componentDidMount() {
    this.loadItems();
  }

  loadItems = () => {
    ItemService.getAllItems().then((res) => {
      this.setState({ items: res.data });
    });
  };

  deleteItemHandler = (id) => {
    ItemService.deleteItem(id).then(() => {
      this.setState({ items: this.state.items.filter((item) => item.id !== id) });
    });
  };

  saveItem = (e) => {
    e.preventDefault();
    const item = {
      title: this.state.title,
      description: this.state.description,
      category: this.state.category,
      status: "AVAILABLE",
    };
    ItemService.createItem(item).then(() => {
      this.setState({ title: "", description: "", category: "", showAdd: false });
      this.loadItems();
    });
  };

  render() {
    return (
      <div>
        <div className="app-header">
          <div className="brand">
            <div className="brand-logo">H</div>
            <div className="brand-text">
              <h1>HELPINGHANDS</h1>
              <p>Donation Portal</p>
            </div>
          </div>
        </div>

        <div className="hero">
          <h2>Turn extra items into <span>real impact</span> for people in need.</h2>
          <p>HelpingHands connects donors who have items to give with recipients who need them, through a simple, trackable process.</p>
        </div>

        <div className="container-main">
          <button className="add-item-btn" onClick={() => this.setState({ showAdd: !this.state.showAdd })}>
            {this.state.showAdd ? "Cancel" : "+ Donate an Item"}
          </button>

          {this.state.showAdd && (
            <div className="panel form-panel" style={{ marginBottom: 30, maxWidth: 420 }}>
              <h3>Create new donation</h3>
              <form onSubmit={this.saveItem}>
                <input
                  placeholder="Title (e.g., Winter jackets)"
                  value={this.state.title}
                  onChange={(e) => this.setState({ title: e.target.value })}
                  required
                />
                <input
                  placeholder="Description"
                  value={this.state.description}
                  onChange={(e) => this.setState({ description: e.target.value })}
                />
                <input
                  placeholder="Category (e.g. Clothes, Books)"
                  value={this.state.category}
                  onChange={(e) => this.setState({ category: e.target.value })}
                />
                <button className="add-item-btn" type="submit">Submit Donation</button>
              </form>
            </div>
          )}

          <div className="panel">
            <h3>Available items</h3>
            <p className="subtext">Live donations currently in the system.</p>

            {this.state.items.length === 0 ? (
              <div className="empty-state">No items donated yet. Be the first!</div>
            ) : (
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.description}</td>
                      <td><span className="status-pill status-available">{item.status}</span></td>
                      <td>
                        <button className="remove-btn" onClick={() => this.deleteItemHandler(item.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ListItemComponent;
