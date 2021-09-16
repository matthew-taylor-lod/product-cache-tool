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

    return (
        <tr className={"ProductRow" + (isLoading ? " loading-product" : "")}>
            <td className="min">
                <button onClick={() => setFilter(product.productId)}>
                    {product.productId}
                </button>
            </td>
            <td className={product.hidden ? " hidden" : ""}>{title}</td>
            <td className="min">
                <button onClick={() => setFilter(cmsProductId)}>
                    {cmsProductId}
                </button>
            </td>
            <td className="min">
                <button onClick={() => setFilter(productGroup)}>
                    {productGroup}
                </button>
            </td>
            <td className="min">
                <button onClick={() => setFilter(algoId)}>
                    {algoId}
                </button>
            </td>
            <td className="min">{price}</td>
                <InStockTd product={product}/>
            <td className="min right">
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
            <td className={"min in-stock-" + product.inStock}>
                {product.inStock ? "✓" : "✗"}
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
