import { useEffect, useMemo, useState } from "react";
import "./my-products.scss";
import { ProductForm } from "./product-form/product-form";
import { deleteProduct, fetchCategoriesList, fetchMyProductsList, fetchProductsList } from "../../api/products.api";
import { ListPagination, ProductCategory, ProductData, ProductListFilters } from "../../models/products.model";
import { environment } from "../../../environments/environment";
import { delayTimeout } from "../../functions/delayTimeout";
import { useAppStore } from "../../stores/appStore";

export const MyProducts = () => {

    const [ productFormPopup, setProductFormPopup ] = useState<{ active: boolean, product: ProductData }>({ active: false, product: null });
    const [ productToDelete, setProductToDelete ] = useState<ProductData>();
    const [ filters, setFilters ] = useState<ProductListFilters>({});
    const [ paginationInputValues, setPaginationInputValues ] = useState<ListPagination>({ pageNumber: 1, pageSize: 10 });
    const [ pagination, setPagination ] = useState<ListPagination>({ pageNumber: 1, pageSize: 10 });
    const [ categoriesList, setCategoriesList ] = useState<ProductCategory[]>([]);
    const [ productsList, setProductsList ] = useState<ProductData[]>([]);
    const [ totalCount, setTotalCount ] = useState<number>();
    const [ isDataLoading, setIsDataLoading ] = useState(false);

    const pageCount: number = useMemo(() => {
        return Math.ceil(totalCount / pagination.pageSize)
    }, [ totalCount, pagination.pageSize ])

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
            const listPageSize = localStorage.getItem("listPageSize");
            await handlePagination({ pageNumber: 1, pageSize: listPageSize ? parseInt(listPageSize) : 10 })
        } catch(e) {
            console.error(e);
        } finally {
            setIsDataLoading(false);
            setIsLoading(false);
        }
    }

    const updatePage = async () => {
        try {
            setIsDataLoading(true);
            setIsLoading(true);
            await handlePagination(pagination);
        } catch(e) {
            console.error(e);
        } finally {
            setIsDataLoading(false);
            setIsLoading(false);
        }
    }

    const handleFilterChanges = async (newFilters: ProductListFilters) => {
        newFilters = { ...filters, ...newFilters };

        try {
            setIsLoading(true);
            setIsDataLoading(true);
            await handlePagination({ pageNumber: 1 }, newFilters);
            setFilters(newFilters);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsDataLoading(false);
        }
    }

    const handlePagination = async (value: Partial<ListPagination>, filterList: ProductListFilters = filters) => {
        if (value.pageSize && value.pageSize !== pagination.pageSize) {
            value.pageNumber = 1;
        }

        const newPagination = { ...pagination, ...value };

        if (newPagination.pageNumber < 1 || newPagination.pageSize < 1) {
            return;
        }

        // if (newPagination.pageNumber > pageCount) {
        //     newPagination.pageNumber = pageCount;
        // }

        try {
            setIsLoading(true);
            setIsDataLoading(true);
            const products = await fetchMyProductsList(filterList, newPagination);
            setPagination(newPagination);
            setPaginationInputValues(newPagination);
            localStorage.setItem("listPageSize", newPagination.pageSize.toString());
            setProductsList(products.data.productsList);
            setTotalCount(products.data.totalCount);
        } catch(e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setIsDataLoading(false);
        }
    }

    const handlePaginationInputChange = async (value: Partial<ListPagination>) => {
        const newPaginationInputValues = { ...paginationInputValues, ...value };

        if (newPaginationInputValues.pageNumber < 1) {
            newPaginationInputValues.pageNumber = 1;
        }

        if (newPaginationInputValues.pageSize < 1) {
            newPaginationInputValues.pageSize = 1;
        }

        if (newPaginationInputValues.pageNumber > pageCount) {
            newPaginationInputValues.pageNumber = pageCount;
        }

        if (newPaginationInputValues.pageSize > 200) {
            newPaginationInputValues.pageSize = 200;
        }

        setPaginationInputValues(newPaginationInputValues);
    }

    const openEditPopup = (product: ProductData) => {
        setProductFormPopup({ active: true, product })
    }

    const handleDeleteProduct = async (product: ProductData) => {
        try {
            setIsLoading(true);
            await deleteProduct(product.id);
            await updatePage();
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
                    <select
                        value={filters.categoryId == null ? "" : filters.categoryId}
                        onChange={(e) => handleFilterChanges({ categoryId: e.currentTarget.value !== "" ? parseInt(e.currentTarget.value) : null })}
                    >
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

                <div className="pagination">
                    <div className="page-size-container">
                        <label htmlFor="page-size-input">Items per page:</label>
                        <input type="number" name="page-size-input"
                            value={paginationInputValues.pageSize}
                            onChange={(e) => handlePaginationInputChange({ pageSize: parseInt(e.currentTarget.value) })}
                            onBlur={(e) => handlePagination({ pageSize: paginationInputValues.pageSize })}
                        />
                    </div>

                    <div className="page-navigation-container">
                        <button disabled={pagination.pageNumber <= 1} onClick={(e) => handlePagination({ pageNumber: 1 })}>First</button>
                        <button disabled={pagination.pageNumber <= 1} onClick={(e) => handlePagination({ pageNumber: pagination.pageNumber - 1 })}>Prev</button>
                        <input type="number" name="page-number"
                            value={paginationInputValues.pageNumber}
                            onChange={(e) => handlePaginationInputChange({ pageNumber: parseInt(e.currentTarget.value) })}
                            onBlur={(e) => handlePagination({ pageNumber: paginationInputValues.pageNumber })}
                        />
                        <span>/ {pageCount}</span>
                        <button disabled={pagination.pageNumber >= pageCount} onClick={(e) => handlePagination({ pageNumber: pagination.pageNumber + 1 })}>Next</button>
                        <button disabled={pagination.pageNumber >= pageCount} onClick={(e) => handlePagination({ pageNumber: Math.ceil(totalCount / pagination.pageSize) })}>Last</button>
                    </div>
                </div>
            </div>

            {productFormPopup.active && <ProductForm
                product={productFormPopup.product}
                categoriesList={categoriesList}
                fetchData={() => fetchData()}
                updatePage={() => updatePage()}
                closePopup={() => setProductFormPopup({ active: false, product: null })}
            ></ProductForm>}
        </>}
    </>
}