import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./ProductRow";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";
import {getProductName} from "./utils";
import("./Tenant.scss");

function Tenant({name, environmentConfig}) {

    const [productMap, setProductMap] = useState({});
    const [sortBy, setSortBy] = useQueryParam("sortBy", StringParam);

    if (!sortBy) setSortBy("sku");

    const sortingMethods = {
        sku: {
            name: "sku",
            sort: (a, b) => a.productId - b.productId
        },
        name: {
            name: "name",
            sort:(a, b) => getProductName(a).localeCompare(getProductName(b))
        }
    };

    useEffect(() => {
        const productsUrl = environmentConfig.productsUrl.replace("{tenant}", name);
        axios.get(productsUrl, {crossdomain: true})
            .then(response => response.data)
            .then(json => mapProducts(json.products));
    }, [name, environmentConfig]);

    function mapProducts(products) {
        const pm = {};
        products?.forEach(e => {
            pm[e.productId] = e;
        });
        setProductMap(pm);
    }

    function getSortingFunction() {
        const sortingMethod = sortingMethods[sortBy];
        return (sortingMethod) ? sortingMethod.sort : sortingMethods["sku"].sort;
    }

    const productRows = Object.values(productMap)
        .sort(getSortingFunction())
        .map((v, i) => <ProductRow data={v}
                                   key={i}
                                   productUrl={environmentConfig.productUrl}
                                   cacheUpdateUrls={environmentConfig.cacheUpdateUrls} />);

    return (
        <div className="Tenant">
            {productRows.length > 0 && <table className="striped">
                <thead>
                <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Product ID</th>
                    <th>Group</th>
                    <th>Algo ID</th>
                    <th>Price</th>
                    <th>In Stock</th>
                    <th/>
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

export default Tenant;
