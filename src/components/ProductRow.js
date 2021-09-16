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

    return (
        <tr className={"ProductRow" + (isLoading ? " loading-product" : "")}>
            <td>
                <button onClick={() => setFilter(product.productId)}>
                    {product.productId}
                </button>
            </td>
            <td className={"product-title" + (product.hidden ? " hidden" : "")}>{title}</td>
            <td>
                <button onClick={() => setFilter(cmsProductId)}>
                    {cmsProductId}
                </button>
            </td>
            <td>
                <button onClick={() => setFilter(productGroup)}>
                    {productGroup}
                </button>
            </td>
            <td>
                <button onClick={() => setFilter(algoId)}>
                    {algoId}
                </button>
            </td>
            <td>{price}</td>
                <InStockTd product={product}/>
            <td className="right">
                <button onClick={() => addProductToLoadingQueue(product)}>
                    Refresh
                </button>
            </td>
        </tr>
    )
}

function InStockTd({product}) {
    const reasons = [];
    if (product.adminOutOfStock) reasons.push("admin");
    if (product.cmsProxyAlgoOutOfStock) reasons.push("algo");
    if (product.cmsProductOutOfStock) reasons.push("product");
    if (product.cmsProductDosageOutOfStock) reasons.push("dosage");
    if (product.cmsProductProxyOutOfStock) reasons.push("proxy");

    const summary = reasons.map(e => <li>{e}</li>);

    return (
        <>
            <td className={"in-stock-" + product.inStock}>
                {product.inStock ? "✓" : "✗"}
            </td>
            <td className="in-stock-false stock-summary">
                <ul>
                    {summary}
                </ul>
            </td>
        </>
    );
}

export default ProductRow;
