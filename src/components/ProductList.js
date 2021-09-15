import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./ProductRow";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";
import {getProductName, sortingMethods} from "./utils";
import("./ProductList.scss");

function ProductList({tenant, environmentConfig}) {

    const [productMap, setProductMap] = useState({});
    const [sortBy, setSortBy] = useQueryParam("sortBy", StringParam);
    const [filter, setFilter] = useQueryParam("filter", StringParam);

    if (!sortBy) setSortBy("sku");

    useEffect(() => {
        const productsUrl = environmentConfig.productsUrl.replace("{tenant}", tenant);
        axios.get(productsUrl, {crossdomain: true})
            .then(response => response.data)
            .then(json => mapProducts(json.products));
    }, [tenant, environmentConfig]);

    function mapProducts(products) {
        const pm = {};
        products?.forEach(e => {
            pm[e.productId] = e;
        });
        setProductMap(pm);
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

    const productRows = Object.values(productMap)
        .filter(filterFunction)
        .sort(getSortingFunction())
        .map((v) => <ProductRow data={v}
                                key={v.productId}
                                productUrl={environmentConfig.productUrl}
                                cacheUpdateUrls={environmentConfig.cacheUpdateUrls}
                                setFilter={setFilter}/>);

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
                    <th className="right refresh">Refresh All</th>
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
