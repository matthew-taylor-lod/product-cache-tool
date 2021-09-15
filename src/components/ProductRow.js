import React, {useState} from "react";
import axios from "axios";
import {getProductName} from "./utils";
import("./ProductRow.scss");

function ProductRow({product, addProductToLoadingQueue, isLoading, setFilter}) {

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
        <tr className={"ProductRow" + (isLoading ? " loading-product" : "")}>
            <td>
                <a href="#" onClick={() => setFilter(product.productId)}>
                    {product.productId}
                </a>
            </td>
            <td className={"product-title" + (product.hidden ? " hidden" : "")}>{title}</td>
            <td>
                <a href="#" onClick={() => setFilter(cmsProductId)}>
                    {cmsProductId}
                </a>
            </td>
            <td>
                <a href="#" onClick={() => setFilter(productGroup)}>
                    {productGroup}
                </a>
            </td>
            <td>
                <a href="#" onClick={() => setFilter(algoId)}>
                    {algoId}
                </a>
            </td>
            <td>{price}</td>
            {inStockTd}
            <td className="right">
                <a href="#" onClick={() => addProductToLoadingQueue(product)}>
                    Refresh
                </a>
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
