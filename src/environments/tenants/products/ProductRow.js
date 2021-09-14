import React, {useEffect, useState} from "react";
import axios from "axios";
import("./ProductRow.scss");

function ProductRow({data, productUrl, cacheUpdateUrls}) {

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

    const title = product.productTitle
        ? product.productTitle
        : product.dosageTitle + " " + product.productLabel;

    const price = product.price === -1
        ? ""
        : product.currency + product.price;

    return (
        <tr className={"ProductRow" + (loading ? " loading-product" : "")}>
            <td>{product.productId}</td>
            <td>
                <span className={"product-title" + (product.hidden ? " hidden" : "")}>
                    {title}
                </span>
            </td>
            <td>{product.cmsProductId}</td>
            <td className="product-group">{product.productGroup?.toLowerCase()}</td>
            <td>{product.e24AlgorithmId !== 0 ? product.e24AlgorithmId : ""}</td>
            <td>{price}</td>
            <td className={"center in-stock-" + product.inStock}>{product.inStock ? "✓" : "✗"}</td>
            <td onClick={() => update()}>Refresh</td>
        </tr>
    )
}

export default ProductRow;
