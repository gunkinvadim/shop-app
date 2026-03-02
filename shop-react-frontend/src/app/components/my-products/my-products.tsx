import { useEffect, useState } from "react";
import "./my-products.scss";
import { ProductForm } from "./product-form/product-form";
import { fetchCategoriesList } from "../../api/products.api";
import { ProductCategory } from "../../models/products.model";

export const MyProducts = () => {

    const [ productFormPopup, setProductFormPopup ] = useState<{ active: boolean, productId: number }>({ active: false, productId: null });
    const [ categoriesList, setCategoriesList ] = useState<ProductCategory[]>([]);
    const [ isLoading, setIsLoading ] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await fetchCategoriesList();
            setCategoriesList(res.data);
            debugger
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }


    return <>
        <div className="my-products-container">
            <div className="my-products-header">
                <h1>Products List</h1>
                <button className="new-product-btn" onClick={() => setProductFormPopup({ active: true, productId: null })}>Add Product</button>
            </div>

            <div className="my-products-list">

            </div>
        </div>

        {productFormPopup.active && <ProductForm
            productId={productFormPopup.productId}
            categoriesList={categoriesList}
            closePopup={() => setProductFormPopup({ active: false, productId: null })}
        ></ProductForm>}
    </>
}