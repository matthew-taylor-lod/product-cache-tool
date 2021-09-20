import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./ProductRow";
import {getProductData, sortingMethods} from "./utils";
import("./ProductList.scss");

function ProductList({tenant, environmentConfig, filter, setFilter, sortBy, setSortBy}) {

    const [productMap, setProductMap] = useState({});
    const [loadingQueue, setLoadingQueue] = useState([]);
    const [loadingQueueLookup, setLoadingQueueLookup] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const productsCallSuffix = "/blueprint/servlet/eh/{tenant}/api/products";
    const updateCallSuffix = "/blueprint/servlet/eh/{tenant}/api/productCache/{sku}";
    const productCallSuffix = "/blueprint/servlet/eh/{tenant}/api/product/{sku}";

    useEffect(() => {
        const productsCalls = Object.values(environmentConfig.servers).map(server => {
            const productsUrl = server + productsCallSuffix.replace("{tenant}", tenant);
            return axios.get(productsUrl);
        });

        Promise.all(productsCalls).then(responses => {
            const loadedProducts = {};

            responses.forEach(response => {
                const hostname = new URL(response.config.url).hostname;

                response.data.products.forEach(productInformation => {
                    const sku = productInformation.productId;

                    let consolidatedProductInformation = loadedProducts[sku];

                    if (!consolidatedProductInformation) {
                        loadedProducts[sku] = {};
                        consolidatedProductInformation = loadedProducts[sku];
                    }

                    consolidatedProductInformation[hostname] = productInformation;
                });
            });

            const pm = {};

            Object.values(loadedProducts).forEach(productInformation => {
               const product = getProductData(productInformation, environmentConfig, tenant);
               pm[product.sku] = product;
            });

            setProductMap(pm);
        });
    }, [environmentConfig, tenant, setProductMap]);

    useEffect(() => {
        if (!loading && loadingQueue.length > 0) {
            const product = loadingQueue.shift();
            setLoadingQueue( [ ...loadingQueue ]);

            setLoading(true);

            const updateCalls = Object.values(environmentConfig.servers).map(server => {
                const updateUrl = server + updateCallSuffix.replace("{tenant}", tenant).replace("{sku}", product.sku)
                return axios.get(updateUrl)
                    .then(response => {
                        const productUrl = server + productCallSuffix.replace("{tenant}", tenant).replace("{sku}", product.sku)
                        return axios.get(productUrl);
                    });
            });

            Promise.all(updateCalls)
                .then(responses => {

                    const consolidatedProductInformation = {};

                    responses.forEach(response => {
                        const hostname = new URL(response.config.url).hostname;
                        consolidatedProductInformation[hostname] = response.data.products[0];
                    });

                    const product = getProductData(consolidatedProductInformation, environmentConfig, tenant);

                    loadingQueueLookup.delete(product.sku);
                    setLoadingQueueLookup(new Set(loadingQueueLookup));

                    productMap[product.sku] = product;
                    setProductMap({ ...productMap })

                    setLoading(false);
                });
        }
    }, [environmentConfig, tenant, loading, setLoading, loadingQueue, setLoadingQueue, loadingQueueLookup, setLoadingQueueLookup, productMap, setProductMap]);

    function addProductToLoadingQueue(product) {
        if (!loadingQueueLookup.has(product.sku)) {

            loadingQueueLookup.add(product.sku)
            setLoadingQueueLookup(new Set(loadingQueueLookup));

            loadingQueue.push(product);
            setLoadingQueue([...loadingQueue]);
        }
    }

    function updateAll() {
        const sortedFilteredProducts = Object.values(productMap)
            .filter(filterFunction)
            .sort(getSortingFunction());

        sortedFilteredProducts.forEach(product => {
            const sku = product.sku;

            if (!loadingQueueLookup.has(sku)) {
                loadingQueueLookup.add(sku);
                loadingQueue.push(product);
            }
        });

        setLoadingQueueLookup(new Set(loadingQueueLookup));
        setLoadingQueue([...loadingQueue]);
    }

    function filterFunction(product) {
        if (!filter) return true;

        const filterValues = filter.split(",").map(e => e.trim().toUpperCase()).filter(e => e.length > 0);

        if (filterValues.length === 0) return true;

        let pass = false;

        filterValues.forEach(filterValue => {
            if (product.filterableString.includes(filterValue)) {
                pass = true;
            }
        });

        return pass;
    }

    function getSortingFunction() {
        const sortingMethod = sortingMethods[sortBy];
        return (sortingMethod) ? sortingMethod.sort : sortingMethods["sku"].sort;
    }

    function isSortBySelected(name) {
        return (sortBy === name) ? "selected" : "";
    }

    const sortedFilteredProducts = Object.values(productMap)
        .filter(filterFunction)
        .sort(getSortingFunction());

    const productRows = sortedFilteredProducts.map((product) => {
        return <ProductRow key={product.sku}
                           product={product}
                           isLoading={loadingQueueLookup.has(product.sku)}
                           addProductToLoadingQueue={addProductToLoadingQueue}
                           setFilter={setFilter}/>
    });

    const showing = productRows.length;
    const total = Object.values(productMap).length;

    return (
        <div className="ProductList">
            <div className="tools">
                <div className="filter">
                    <span>Filter by</span>
                    <div className="filter-box">
                        <input className="filter-input"
                               placeholder="type here to filter table"
                               value={filter}
                               onChange={e => setFilter(e.target.value)}/>
                        <div className="filter-clear" onClick={() => setFilter("") }>
                            clear
                        </div>
                    </div>
                    <span>Showing {showing} of {total}</span>
                </div>
                <div className="sort-by">
                    <span>Sort by </span>
                    <button className={isSortBySelected("name")} onClick={() => setSortBy("name")}>Name</button>
                    <span> / </span>
                    <button className={isSortBySelected("sku")} onClick={() => setSortBy("sku")}>SKU</button>
                </div>
            </div>

            {productRows.length > 0 &&
                <table className="striped">
                    <thead>
                    <tr>
                        <th className="min">SKU</th>
                        <th>Name</th>
                        <th className="min">Product</th>
                        <th className="min">Group</th>
                        <th className="min">Algo</th>
                        <th className="min">Price</th>
                        <th colSpan={1} className="min">In Stock</th>
                        <th colSpan={2} className="min">Preview</th>
                        <th className="min"><button onClick={() => updateAll()}>Update All</button></th>
                    </tr>
                    </thead>
                    <tbody>
                    {productRows}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default ProductList;
