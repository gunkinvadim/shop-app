import { useState, useMemo, useEffect } from "react";
import { environment } from "../../../environments/environment";
import { fetchCategoriesList, fetchMyProductsList, fetchProductsList } from "../../api/products.api";
import { ProductListFilters, ListPagination, ProductCategory, ProductData, CartItem } from "../../models/products.model";
import { useAppStore } from "../../stores/appStore";
import "./shop.scss";
import useUserStore from "../../stores/userStore";
import { count } from "console";
import { useCartStore } from "../../stores/cartStore";

export const Shop = () => {
    const [ filters, setFilters ] = useState<ProductListFilters>({});
    const [ paginationInputValues, setPaginationInputValues ] = useState<ListPagination>({ pageNumber: 1, pageSize: 10 });
    const [ pagination, setPagination ] = useState<ListPagination>({ pageNumber: 1, pageSize: 10 });
    const [ categoriesList, setCategoriesList ] = useState<ProductCategory[]>([]);
    const [ productsList, setProductsList ] = useState<ProductData[]>([]);
    const [ totalCount, setTotalCount ] = useState<number>();
    const [ isDataLoading, setIsDataLoading ] = useState(false);

    const userData = useUserStore(state => state.userData);

    const cart = useCartStore(state => state.cart);
    const setCart = useCartStore(state => state.setCart);

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
            const products = await fetchProductsList(filterList, newPagination);
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


    const handleCart = (product: ProductData, action: "ADD" | "REMOVE") => {
        let cartItem = cart.find(i => i.product.id === product.id);

        switch (action) {
            case "ADD":
                if (cartItem) {
                    cartItem.count++
                } else {
                    cartItem = { product: product, count: 1 };
                }
                setCart([ ...cart.filter(i => i.product.id !== product.id), cartItem ]);
                break
            case "REMOVE":
                if (cartItem) {
                    if (cartItem.count > 1) {
                        cartItem.count--;
                        setCart([ ...cart.filter(i => i.product.id !== product.id), cartItem ]);
                    } else if (cartItem.count === 1) {
                        setCart(cart.filter(i => i.product.id !== product.id));
                    }
                }
                break;
        }
    }


    return <>
        {isDataLoading ? <div>Loading...</div> : <>
            <div className="shop-container">
                <div className="shop-header">
                    <h1>Shop</h1>
                    {/* <button className="new-product-btn" onClick={() => setProductFormPopup({ active: true, product: null })}>Add New Product</button> */}
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

                <div className="products-scroll-area">
                    <div className="products-list">
                        {productsList.map(product => <div key={product.id} className="product-card">
                            <h2 className="product-name">{product.name}</h2>
                            <img className="product-image" src={environment.baseUrl + product.imageUrl} alt={product.name}></img>
                            <div className="product-category">{product.category?.name}</div>
                            <div className="product-description">{product.description}</div>
                            <div className="product-price">{product.price}$</div>
                            {userData && userData.roles.includes("BUYER") && <div className="buttons-container">
                                {cart.some(i => i.product.id === product.id) ? <>
                                    <button className="cart-decrese" onClick={() => handleCart(product, "REMOVE")}>-</button>
                                    {cart.find(i => i.product.id === product.id).count}
                                    <button className="cart-increase" onClick={() => handleCart(product, "ADD")}>+</button>
                                </> : <>
                                    <button className="add-to-cart" onClick={() => handleCart(product, "ADD")}>Add to cart</button>
                                </>}
                            </div>}
                        </div>)}
                    </div>
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
        </>}
    </>
}