import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./products/ProductRow";
import("./EnvironmentSelector.scss");

function Environment({config, environmentConfig}) {

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const productsUrl = environmentConfig.productsUrl.replace("{tenant}", "uk");
        axios.get(productsUrl, {crossdomain: true})
            .then(response => response.data)
            .then(json => setProducts(json.products));
    }, [config, environmentConfig]);

    const productRows = products
        .sort((a,b) => a.productId - b.productId)
        .map((e, i) => <ProductRow data={e} key={i}
                                   productUrl={environmentConfig.productUrl}
                                   cacheUpdateUrls={environmentConfig.cacheUpdateUrls} />);

    return (
        <div className="Environment">
            <h1>{environmentConfig.name}</h1>
            <table className="striped">
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

        </div>
    )
}

export default Environment;
