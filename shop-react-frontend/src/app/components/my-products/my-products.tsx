import { useEffect, useState } from "react";
import "./my-products.scss";
import { ProductForm } from "./product-form/product-form";
import { deleteProduct, fetchCategoriesList, fetchMyProductsList, fetchProductsList } from "../../api/products.api";
import { ProductCategory, ProductData, ProductListFilters } from "../../models/products.model";
import { environment } from "../../../environments/environment";
import { delayTimeout } from "../../functions/delayTimeout";
import { useAppStore } from "../../stores/appStore";

export const MyProducts = () => {

    const [ productFormPopup, setProductFormPopup ] = useState<{ active: boolean, product: ProductData }>({ active: false, product: null });
    const [ productToDelete, setProductToDelete ] = useState<ProductData>();
    const [ filters, setFilters ] = useState<ProductListFilters>({});
    const [ categoriesList, setCategoriesList ] = useState<ProductCategory[]>([]);
    const [ productsList, setProductsList ] = useState<ProductData[]>([]);
    const [ isDataLoading, setIsDataLoading ] = useState(false);

    const isLoading = useAppStore((state => state.isLoading));
    const setIsLoading = useAppStore((state => state.setIsLoading));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsDataLoading(true);
            setIsLoading(true);
            const categories = await fetchCategoriesList();
            setCategoriesList(categories.data);
            const products = await fetchMyProductsList(filters);
            setProductsList(products.data);
        } catch(e) {
            console.error(e);
        } finally {
            setIsDataLoading(false);
            setIsLoading(false);
        }
    }

    const handleFilterChanges = async (newFilters: ProductListFilters) => {
        newFilters = { ...filters, ...newFilters };
        setFilters(newFilters);

        try {
            setIsLoading(true);
            setIsDataLoading(true);
            const products = await fetchMyProductsList(newFilters);
            setProductsList(products.data);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsDataLoading(false);
        }
    }

    const openEditPopup = (product: ProductData) => {
        setProductFormPopup({ active: true, product })
    }

    const handleDeleteProduct = async (product: ProductData) => {
        try {
            setIsLoading(true);
            await deleteProduct(product.id);
            const products = await fetchMyProductsList(filters);
            setProductsList(products.data);
            setProductToDelete(null);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }


    return <>
        {isDataLoading ? <div>Loading...</div> : <>
            <div className="my-products-container">
                <div className="my-products-header">
                    <h1>Products List</h1>
                    <button className="new-product-btn" onClick={() => setProductFormPopup({ active: true, product: null })}>Add New Product</button>
                </div>

                <div className="filters-container">
                    <select onChange={(e) => handleFilterChanges({ categoryId: e.currentTarget.value !== "" ? parseInt(e.currentTarget.value) : null })}>
                        <option value={""}>All categories</option>
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
                            {productToDelete?.id === product.id ? <>
                                <button className="confirm-deletion" onClick={() => handleDeleteProduct(product)}>Confirm deletion</button>
                                <button className="cancel" onClick={() => setProductToDelete(null)}>Cancel</button>
                            </> : <>
                                <button className="edit" onClick={() => openEditPopup(product)}>Edit</button>
                                <button className="delete" onClick={() => setProductToDelete(product)}>Delete</button>
                            </>}
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
        </>}
    </>
}