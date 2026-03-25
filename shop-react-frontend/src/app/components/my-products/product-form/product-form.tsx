import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "./product-form.scss";
import useUserStore from "../../../stores/userStore";
import { ProductCategory, ProductData, ProductFormData } from "../../../models/products.model";
import { createNewProduct, editProduct } from "../../../api/products.api";

export const ProductForm = ({ product, categoriesList, closePopup, fetchData }:
    { product: ProductData, categoriesList: ProductCategory[], closePopup: () => void, fetchData: () => Promise<void> }) => {

    const [ productFormData, setProductFormData ] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        sellerId: null,
        categoryId: null
    });

    const [ selectedImage, setSelectedImage ] = useState<File>();

    const userData = useUserStore((state => state.userData));

    useEffect(() => {
        console.log(product);

        if (product) {
            setProductFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                sellerId: product.seller.id,
                categoryId: product.category.id
            })
        } else {
            setProductFormData({
                ...productFormData,
                sellerId: userData.id
            })
        }
    }, []);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setSelectedImage(e.target.files[0]);
    };

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();

        if (product) {
            await handleProductEdit();
        } else {
            await handleProductCreate();
        }
    };


    const handleProductEdit = async () => {
        const formData = new FormData();

        if (selectedImage) {
            // append file
            formData.append("image", selectedImage);

            Object.entries(productFormData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, String(value));
                }
            });
        }

        try {
            const res = await editProduct(product.id, selectedImage ? formData : productFormData);
            console.log(res);
            await fetchData();
            closePopup();
        } catch(err) {
            console.error(err);
            alert("Error editing product");
        }
        return;
    }

    const handleProductCreate = async () => {
        if (!selectedImage) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        // append file
        formData.append("image", selectedImage);

        Object.entries(productFormData).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        });

        try {
            const res = await createNewProduct(formData);
            console.log(res);
            await fetchData();
            closePopup();
        } catch(err) {
            console.error(err);
            alert("Error creating product");
        }
    }

    return <div className="overlay">
        <form className="popup"
            onSubmit={submitForm}
            onReset={closePopup}
        >
            <div className="popup-header">
                <h2>Product</h2>
            </div>
            <div className="popup-body">
                <div className="input-container">
                    <label htmlFor="name">Product name</label>
                    <input id="name" type="text" value={productFormData.name} onInput={(e) => setProductFormData({ ...productFormData, name: e.currentTarget.value })}/>
                </div>
                <div className="input-container">
                    <label htmlFor="categoryId">Category</label>
                    <select onChange={(e) => setProductFormData({ ...productFormData, categoryId: parseInt(e.currentTarget.value) })}
                        value={productFormData.categoryId}
                    >
                        <option value={null}>Select category</option>
                        {categoriesList.map(i => <option key={i.id} value={i.id}>
                            {i.name}
                        </option>)}
                    </select>
                </div>
                <div className="input-container">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" value={productFormData.description} onInput={(e) => setProductFormData({ ...productFormData,description: e.currentTarget.value })}/>
                </div>
                <div className="input-container">
                    <label htmlFor="image">Image</label>
                    <input id="image" type="file" onChange={(e) => handleFileSelect(e)}/>
                </div>
                <div className="input-container">
                    <label htmlFor="price">Price ($)</label>
                    <input id="price" type="number" value={productFormData.price} onInput={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.currentTarget.value) })}/>
                </div>
            </div>
            <div className="popup-footer">
                <button className="cancel-btn" type="reset">Cancel</button>
                <button className="submit-btn" type="submit">Submit</button>
            </div>
        </form>
    </div>
}