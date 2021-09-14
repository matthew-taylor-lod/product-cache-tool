import React, {useEffect, useState} from "react";
import axios from "axios";
import ProductRow from "./products/ProductRow";
import("./Tenant.scss");

function Tenant({name, environmentConfig}) {

    const [productMap, setProductMap] = useState({});

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

    const productRows = Object.values(productMap).map((v, i) => <ProductRow data={v}
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
