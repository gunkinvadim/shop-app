import { useEffect, useState } from "react";
import "./my-products.scss";
import { ProductForm } from "./product-form/product-form";
import { fetchCategoriesList, fetchMyProductsList, fetchProductsList } from "../../api/products.api";
import { ProductCategory, ProductData, ProductListFilters } from "../../models/products.model";
import { environment } from "../../../environments/environment";

export const MyProducts = () => {

    const [ productFormPopup, setProductFormPopup ] = useState<{ active: boolean, product: ProductData }>({ active: false, product: null });
    const [ filters, setFilters ] = useState<ProductListFilters>({});
    const [ categoriesList, setCategoriesList ] = useState<ProductCategory[]>([]);
    const [ productsList, setProductsList ] = useState<ProductData[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const categories = await fetchCategoriesList();
            setCategoriesList(categories.data);
            const products = await fetchMyProductsList(filters);
            setProductsList(products.data);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFilterChanges = async (newFilters: ProductListFilters) => {
        newFilters = { ...filters, ...newFilters };
        setFilters(newFilters);

        try {
            setIsLoading(true);
            debugger
            const products = await fetchMyProductsList(newFilters);
            setProductsList(products.data);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    const openEditPopup = (product: ProductData) => {
        setProductFormPopup({ active: true, product })
    }


    return <>
        <div className="my-products-container">
            <div className="my-products-header">
                <h1>Products List</h1>
                <button className="new-product-btn" onClick={() => setProductFormPopup({ active: true, product: null })}>Add New Product</button>
            </div>

            <div className="filters-container">
                <select onChange={(e) => handleFilterChanges({ categoryId: parseInt(e.currentTarget.value) })}>
                    <option value={null}>All categories</option>
                    {categoriesList.map(i => <option key={i.id} value={i.id}>
                        {i.name}
                    </option>)}
                </select>
            </div>

            <div className="my-products-list">
                {productsList.map(product => <div key={product.id} className="product-card">
                    <h2 className="product-name">{product.name}</h2>
                    <img className="product-image" src={environment.baseUrl + product.imageUrl} alt={product.name}></img>
                    <div className="product-category">{product.category?.name}</div>
                    <div className="product-description">{product.description}</div>
                    <div className="product-price">{product.price}$</div>
                    <div className="buttons-container">
                        <button className="edit" onClick={() => openEditPopup(product)}>Edit</button>
                        <button className="delete">Delete</button>
                    </div>
                </div>)}
            </div>
        </div>

        {productFormPopup.active && <ProductForm
            product={productFormPopup.product}
            categoriesList={categoriesList}
            fetchData={() => fetchData()}
            closePopup={() => setProductFormPopup({ active: false, product: null })}
        ></ProductForm>}
    </>
}