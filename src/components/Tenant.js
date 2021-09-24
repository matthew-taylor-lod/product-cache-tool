import axios from "axios";
import {getProductData} from "./utils";
import React, {useEffect, useState} from "react";
import ProductList from "./ProductList";
import Product from "./Product";

function Tenant({tenant, environmentConfig, sku, setSku, filter, setFilter, sortBy, setSortBy}) {

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
            return axios.get(productsUrl, {crossdomain: true});
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
            setLoadingQueue([...loadingQueue]);

            setLoading(true);

            const updateCalls = Object.values(environmentConfig.servers).map(server => {
                const updateUrl = server + updateCallSuffix.replace("{tenant}", tenant).replace("{sku}", product.sku)
                return axios.get(updateUrl,{crossdomain: true})
                    .then(response => {
                        const productUrl = server + productCallSuffix.replace("{tenant}", tenant).replace("{sku}", product.sku)
                        return axios.get(productUrl, {crossdomain: true});
                    });
            });

            Promise.all(updateCalls).then(responses => {
                const consolidatedProductInformation = {};

                responses.forEach(response => {
                    const hostname = new URL(response.config.url).hostname;
                    consolidatedProductInformation[hostname] = response.data.products[0];
                });

                const product = getProductData(consolidatedProductInformation, environmentConfig, tenant);

                loadingQueueLookup.delete(product.sku);
                setLoadingQueueLookup(new Set(loadingQueueLookup));

                productMap[product.sku] = product;
                setProductMap({...productMap})

                    setLoading(false);
            });
        }
    }, [environmentConfig, tenant, loading, setLoading, loadingQueue, setLoadingQueue, loadingQueueLookup, setLoadingQueueLookup, productMap, setProductMap]);

    function addProductsToLoadingQueue(products) {
        products.forEach(product => {
            if (!loadingQueueLookup.has(product.sku)) {
                loadingQueueLookup.add(product.sku);
                loadingQueue.push(product);
            }
        });
        setLoadingQueue([...loadingQueue]);
        setLoadingQueueLookup(new Set(loadingQueueLookup));
    }

    return (
        <>
            {sku && <Product environmentConfig={environmentConfig}
                             tenant={tenant}
                             sku={sku}
                             setSku={setSku}/>
            }
            <ProductList productMap={productMap}
                         loadingQueueLookup={loadingQueueLookup}
                         addProductsToLoadingQueue={addProductsToLoadingQueue}
                         sku={sku}
                         setSku={setSku}
                         filter={filter}
                         setFilter={setFilter}
                         sortBy={sortBy}
                         setSortBy={setSortBy}/>
        </>
    )
}

export default Tenant;
