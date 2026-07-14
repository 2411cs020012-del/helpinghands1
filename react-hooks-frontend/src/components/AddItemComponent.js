import React, { Component } from "react";
import ItemService from "../services/ItemService";

class AddItemComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { title: "", description: "", category: "", status: "AVAILABLE" };
  }

  saveItem = (e) => {
    e.preventDefault();
    const item = {
      title: this.state.title,
      description: this.state.description,
      category: this.state.category,
      status: this.state.status,
    };
    ItemService.createItem(item).then(() => {
      window.location.href = "/";
    });
  };

  render() {
    return (
      <div className="container">
        <h2 className="text-center">Add Item</h2>
        <form>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              className="form-control"
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              className="form-control"
              value={this.state.description}
              onChange={(e) => this.setState({ description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              className="form-control"
              value={this.state.category}
              onChange={(e) => this.setState({ category: e.target.value })}
            />
          </div>
          <button className="btn btn-success" onClick={this.saveItem}>
            Submit
          </button>
        </form>
      </div>
    );
  }
}

export default AddItemComponent;
