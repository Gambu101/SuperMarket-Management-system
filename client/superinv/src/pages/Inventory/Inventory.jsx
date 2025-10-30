import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inventory.css"

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [nameSearchTerm, setNameSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [priceSearchTerm, setPriceSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get("/api/inventory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInventory(response.data);
        setFilteredInventory(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInventory();
  }, [token]);

  useEffect(() => {
    const filtered = inventory.filter((item) => {
      return (
        (nameSearchTerm === "" ||
          item.product_name
            .toLowerCase()
            .includes(nameSearchTerm.toLowerCase())) &&
        (categorySearchTerm === "" ||
          item.category
            .toLowerCase()
            .includes(categorySearchTerm.toLowerCase())) &&
        (priceSearchTerm === "" || item.price <= parseFloat(priceSearchTerm))
      );
    });
    setFilteredInventory(filtered);
  }, [nameSearchTerm, categorySearchTerm, priceSearchTerm, inventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/inventory",
        {
          product_name: productName,
          product_description: productDescription,
          quantity,
          price,
          category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setInventory([...inventory, response.data]);
      setFilteredInventory([...filteredInventory, response.data]);
      setProductName("");
      setProductDescription("");
      setQuantity("");
      setPrice("");
      setCategory("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Inventory</h1>
      <div>
        <label>
          Search by Name:
          <input
            type="text"
            placeholder="Search by name..."
            value={nameSearchTerm}
            onChange={(e) => setNameSearchTerm(e.target.value)}
          />
        </label>
        <label>
          Search by Category:
          <input
            type="text"
            placeholder="Search by category..."
            value={categorySearchTerm}
            onChange={(e) => setCategorySearchTerm(e.target.value)}
          />
        </label>
        <label>
          Search by Price (less than or equal to):
          <input
            type="number"
            step="0.01"
            placeholder="Search by price..."
            value={priceSearchTerm}
            onChange={(e) => setPriceSearchTerm(e.target.value)}
          />
        </label>
      </div>
      <div className="inventory_page">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.product_description}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={handleSubmit}>
        <label>
          Product Name:
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </label>
        <label>
          Description:
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <label>
          Price:
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>
        <button type="submit">Add to Inventory</button>
      </form>
      </div>

      
    </div>
  );
};

export default Inventory;
