import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../axios";

const UpdateProduct = ({ id: propId, uploadEndpoint, submitEndpoint, onCancel, onSuccess }) => {
    const { id: paramId } = useParams();
    const id = propId || paramId;
    const [product, setProduct] = useState({
        name: "",
        brand: "",
        description: "",
        price: 0,
        category: "",
        stock_qty: 0,
        release_date: "",
        product_available: false,
        image_url: ""
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Assuming submitEndpoint is like /retailer/products, and we can GET /retailer/products/{id}
                // We need to construct the get URL.
                // If submitEndpoint is passed as /retailer/products, we append /id
                const response = await axios.get(`${submitEndpoint}/${id}`);
                const data = response.data.product || response.data; // Handle both wrapped and unwrapped responses

                // Map backend fields to state if necessary
                setProduct({
                    name: data.name || "",
                    brand: data.brand || "",
                    description: data.description || "",
                    price: data.price || 0,
                    category: data.category || "",
                    stock_qty: data.stock_qty || 0,
                    // Use created_at as release_date if release_date doesn't exist
                    release_date: data.release_date || (data.created_at ? data.created_at.split('T')[0] : ""),
                    product_available: data.product_available || false,
                    image_url: data.image_url || ""
                });

                if (data.image_url) {
                    // Handle both relative and absolute URLs
                    const imageUrl = data.image_url.startsWith('/')
                        ? `http://localhost:8000${data.image_url}`
                        : data.image_url;
                    setImagePreview(imageUrl);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                alert("Error fetching product details");
            }
        };

        if (id && submitEndpoint) {
            fetchProduct();
        }
    }, [id, submitEndpoint]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        if (type === "number") {
            setProduct({ ...product, [name]: value === "" ? "" : parseFloat(value) });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            let imageUrl = product.image_url;

            if (image) {
                const formData = new FormData();
                formData.append("image", image);

                const uploadRes = await axios.post(uploadEndpoint, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                imageUrl = uploadRes.data.url;
            }

            const payload = {
                name: product.name,
                brand: product.brand,
                description: product.description,
                price: product.price,
                category: product.category,
                stock_qty: product.stock_qty,
                release_date: product.release_date,
                product_available: product.product_available,
                image_url: imageUrl
            };

            await axios.put(`${submitEndpoint}/${id}`, payload);
            alert("Product updated successfully");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product: " + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 px-8 py-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Update Product</h1>
                    <p className="text-blue-200 mt-1 text-sm">Update the details of your existing product</p>
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-300 hover:text-white">
                        ✕
                    </button>
                )}
            </div>

            <form className="p-8 space-y-6" onSubmit={submitHandler}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Product Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter product name"
                            onChange={handleInputChange}
                            value={product.name}
                            name="name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Brand</label>
                        <input
                            type="text"
                            name="brand"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter brand name (optional)"
                            value={product.brand || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Description</label>
                    <textarea
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Add product description"
                        value={product.description}
                        name="description"
                        onChange={handleInputChange}
                        rows="3"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0.00"
                                onChange={handleInputChange}
                                value={product.price}
                                name="price"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Category</label>
                        <select
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={product.category || ""}
                            onChange={handleInputChange}
                            name="category"
                        >
                            <option value="">Select category (optional)</option>
                            <option value="Laptop">💻 Laptop</option>
                            <option value="Headphone">🎧 Headphone</option>
                            <option value="Mobile">📱 Mobile</option>
                            <option value="Electronics">⚡ Electronics</option>
                            <option value="Toys">🎮 Toys</option>
                            <option value="Fashion">👕 Fashion</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Stock Quantity</label>
                        <input
                            type="number"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            onChange={handleInputChange}
                            value={product.stock_qty}
                            name="stock_qty"
                            min="0"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Release Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={product.release_date || ""}
                            name="release_date"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-300">Product Image</label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                            {imagePreview && (
                                <div className="mt-2">
                                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-600" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-700/50 rounded-lg border border-gray-700">
                    <input
                        className="w-4 h-4 text-blue-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2 bg-gray-700"
                        type="checkbox"
                        name="product_available"
                        checked={product.product_available}
                        onChange={(e) =>
                            setProduct({ ...product, product_available: e.target.checked })
                        }
                    />
                    <label className="text-sm font-medium text-gray-300 cursor-pointer">
                        Product Available for Sale
                    </label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (onCancel) onCancel();
                        }}
                        className="px-6 py-3 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProduct;
