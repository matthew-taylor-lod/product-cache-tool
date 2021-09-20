
import React from "react";
import("./ProductRow.scss");

function ProductRow({product, isLoading, addProductToLoadingQueue, setFilter}) {

    const hasError = !product.deliveryConsistent || product.previewMissing || product.deliveryMissing;

    const errors = <ul className="error-list small">
        {!product.deliveryConsistent && <li>Delivery inconsistent</li>}
        {product.previewMissing && <li>Missing from preview</li>}
        {product.deliveryMissing && <li>Missing from delivery</li>}
    </ul>


    return (
        <tr className={"ProductRow" + (isLoading ? " loading-product" : "") + (hasError ? " product-error" : "")}>
            <td className="min">
                <button onClick={() => setFilter(product.sku)}>
                    {product.sku}
                </button>
            </td>
            <td>
                <div className={product.hidden ? " hidden" : ""}>{product.name}</div>
                { hasError && errors }
            </td>
            <td className="min">
                <button onClick={() => setFilter(product.cmsProductId)}>
                    {product.cmsProductId}
                </button>
            </td>
            <td className="min small">
                <button onClick={() => setFilter(product.productGroup)}>
                    {product.productGroup}
                </button>
            </td>
            <td className="min">
                <button onClick={() => setFilter(product.e24AlgorithmId)}>
                    {product.e24AlgorithmId}
                </button>
            </td>
            <td className="min right">{product.price}</td>
            <InStockTd product={product}/>
            <td className="min right">
                <button onClick={() => addProductToLoadingQueue(product)}>Update</button>
            </td>
        </tr>
    );
}

function InStockTd({product}) {
    const reasons = [];
    if (product.adminOutOfStock) reasons.push("admin");
    if (product.cmsProxyAlgoOutOfStock) reasons.push("algo");
    if (product.cmsProductOutOfStock) reasons.push("product");
    if (product.cmsProductDosageOutOfStock) reasons.push("dosage");
    if (product.cmsProductProxyOutOfStock) reasons.push("proxy");

    const summary = reasons.map(e => <li key={e}>{e}</li>);

    return (
        <>
            <td className={"min center in-stock-" + product.inStock}>
                {product.inStock ? "✓" : "✗"}
            </td>
            <td className={"min in-stock-" + product.previewInStock}>
                {product.previewInStock ? "✓" : "✗"}
            </td>
            <td className="min in-stock-false stock-summary">
                <ul>
                    {summary}
                </ul>
            </td>
        </>
    );
}

export default ProductRow;
