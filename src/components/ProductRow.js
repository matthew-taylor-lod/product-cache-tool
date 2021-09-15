import React, {useState} from "react";
import axios from "axios";
import {getProductName} from "./utils";
import("./ProductRow.scss");

function ProductRow({data, productUrl, cacheUpdateUrls, setFilter}) {

    const [product, setProduct] = useState(data);
    const [loading, setLoading] = useState(false);

    function update() {
        setLoading(true);
        const updateCalls = cacheUpdateUrls
            .map(templateUrl => {
                const url = templateUrl.replace("{tenant}", data.tenant).replace("{sku}", data.productId)
                return axios.get(url);
            });

        Promise.all(updateCalls)
            .then(responses => {
                const url = productUrl.replace("{tenant}", data.tenant).replace("{sku}", data.productId)
                axios.get(url)
                    .then(response => response.data)
                    .then(json => {
                        setProduct(json.products[0]);
                        setLoading(false);
                    });
            });
    }

    const title = getProductName(product);
    const cmsProductId = product.cmsProductId;
    const productGroup = product.productGroup?.toLowerCase();
    const algoId = product.e24AlgorithmId !== 0
        ? product.e24AlgorithmId
        : "";
    const price = product.price !== -1
        ? product.currency + product.price
        : ""

    const hasStockOverrides = (
        product.cmsProductOutOfStock || product.cmsProductProxyOutOfStock || product.cmsProxyAlgoOutOfStock);

    const inStockTd = hasStockOverrides
        ? <ComplexInStockTd product={product}/>
        : <SimpleInStockTd product={product}/>;

    return (
        <tr className={"ProductRow" + (loading ? " loading-product" : "")}>
            <td>
                <span className="filterable" onClick={() => setFilter(product.productId)}>
                    {product.productId}
                </span>
            </td>
            <td className={"product-title" + (product.hidden ? " hidden" : "")}>{title}</td>
            <td>
                <span className="filterable" onClick={() => setFilter(cmsProductId)}>
                    {cmsProductId}
                </span>
            </td>
            <td>
                <span className="filterable" onClick={() => setFilter(productGroup)}>
                    {productGroup}
                </span>
            </td>
            <td>
                <span className="filterable" onClick={() => setFilter(algoId)}>
                    {algoId}
                </span>
            </td>
            <td>{price}</td>
            {inStockTd}
            <td className="right">
                <span className="refresh-button" onClick={() => update()}>
                    Refresh
                </span>
            </td>
        </tr>
    )
}

function SimpleInStockTd({product}) {
    return (
        <td colSpan={2} className={"in-stock-" + product.inStock}>
            {product.inStock ? "✓" : "✗"}
        </td>
    );
}

function ComplexInStockTd({product}) {
    const reasons = [];
    if (product.adminOutOfStock) reasons.push("admin");
    if (product.cmsProxyAlgoOutOfStock) reasons.push("algo-override");
    if (product.cmsProductOutOfStock) reasons.push("product-override");
    if (product.cmsProductProxyOutOfStock) reasons.push("algo-override");

    const summary = reasons.map(e => <li>{e}</li>);

    return (
        <>
            <td className="in-stock-false">✗</td>
            <td className="in-stock-false stock-summary">
                <ul>
                    {summary}
                </ul>
            </td>
        </>
    );
}

export default ProductRow;
