import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./ProductRow";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";
import {getProductName, sortingMethods} from "./utils";
import("./ProductList.scss");

function ProductList({tenant, environmentConfig}) {

    const [productMap, setProductMap] = useState({});
    const [loadingQueue, setLoadingQueue] = useState([]);
    const [loadingQueueLookup, setLoadingQueueLookup] = useState(new Set());
    const [loading, setLoading] = useState(false);

    const [sortBy, setSortBy] = useQueryParam("sortBy", StringParam);
    const [filter, setFilter] = useQueryParam("filter", StringParam);

    if (!sortBy) setSortBy("sku");

    useEffect(() => {
        const productsUrl = environmentConfig.productsUrl.replace("{tenant}", tenant);
        axios.get(productsUrl, {crossdomain: true})
            .then(response => response.data)
            .then(json => {
                const pm = {};
                json.products?.forEach(e => {
                    pm[e.productId] = e;
                });
                setProductMap(pm);
            });
    }, [tenant, environmentConfig]);

    useEffect(() => {
        if (!loading && loadingQueue.length > 0) {
            const product = loadingQueue.shift();
            setLoadingQueue( [ ...loadingQueue ]);

            setLoading(true);

            const updateCalls = environmentConfig.cacheUpdateUrls
                .map(templateUrl => {
                    const url = templateUrl.replace("{tenant}", product.tenant).replace("{sku}", product.productId)
                    return axios.get(url);
                });

            Promise.all(updateCalls)
                .then(responses => {
                    const url = environmentConfig.productUrl.replace("{tenant}", product.tenant).replace("{sku}", product.productId)
                    axios.get(url)
                        .then(response => response.data)
                        .then(json => {
                            const product = json.products[0];
                            const productId = product.productId;

                            loadingQueueLookup.delete(productId);
                            setLoadingQueueLookup(new Set(loadingQueueLookup));

                            productMap[productId] = product;
                            setProductMap({ ...productMap })

                            setLoading(false);
                        });
                });
        }
    }, [loadingQueue, loading]);

    function addProductToLoadingQueue(product) {
        const productId = product.productId;
        if (!loadingQueueLookup.has(productId)) {

            loadingQueueLookup.add(productId)
            setLoadingQueueLookup(new Set(loadingQueueLookup));

            loadingQueue.push(product);
            setLoadingQueue([...loadingQueue]);
        }
    }

    function refreshAll() {
        const sortedFilteredProducts = Object.values(productMap)
            .filter(filterFunction)
            .sort(getSortingFunction());

        sortedFilteredProducts.forEach(product => {
            const productId = product.productId;

            if (!loadingQueueLookup.has(productId)) {
                loadingQueueLookup.add(productId);
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

        const filterableFields = [
            product.productId,
            getProductName(product),
            product.cmsProductId,
            product.productGroup,
            product.e24AlgorithmId !== 0 ? product.e24AlgorithmId : ""
        ];

        const s = filterableFields.join("\n").toUpperCase();

        let pass = false;

        filterValues.forEach(filterValue => {
            if (s.includes(filterValue)) {
                pass = true;
            }
        });

        return pass;
    }

    function getSortingFunction() {
        const sortingMethod = sortingMethods[sortBy];
        return (sortingMethod) ? sortingMethod.sort : sortingMethods["sku"].sort;
    }

    const sortedFilteredProducts = Object.values(productMap)
        .filter(filterFunction)
        .sort(getSortingFunction());

    const productRows = sortedFilteredProducts.map((v) => <ProductRow product={v}
                                                                addProductToLoadingQueue={addProductToLoadingQueue}
                                                                setFilter={setFilter}
                                                                isLoading={loadingQueueLookup.has(v.productId)}
                                                                key={v.productId} />);

    const showing = productRows.length;
    const total = Object.values(productMap).length;

    return (
        <div className="ProductList">
            <div className="tools">
                <span>Filter by</span>
                <div className="filter-box">
                    <input className="filter"
                           placeholder="type here to filter table"
                           value={filter}
                           onChange={e => setFilter(e.target.value)}/>
                    <span onClick={() => setFilter("") }>clear</span>
                </div>
                <span>Showing {showing} of {total}</span>
            </div>
            {productRows.length > 0 && <table className="striped">
                <thead>
                <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Product ID</th>
                    <th>Group</th>
                    <th>Algo ID</th>
                    <th>Price</th>
                    <th colSpan={2}>In Stock</th>
                    <th><a href="#" onClick={() => refreshAll()}>Refresh All</a></th>
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
