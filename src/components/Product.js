import React, {useEffect, useState} from "react";
import axios from "axios";
import("./Product.scss");

function Product({environmentConfig, tenant, sku, setSku}) {

    const [productCacheEntries, setProductCacheEntries] = useState([]);

    const productCallSuffix = "/blueprint/servlet/eh/{tenant}/api/product/{sku}";

    useEffect(() => {

        const productCalls = Object.values(environmentConfig.servers).map(server => {
            const productsUrl = server + productCallSuffix.replace("{tenant}", tenant).replace("{sku}", sku);
            return axios.get(productsUrl,{crossdomain: true});
        });

        Promise.all(productCalls).then(responses => {
            const pceList = [];

            responses.forEach(response => {
                const responseUrl = new URL(response.config.url);

                const pce = {};
                pce.hostname = responseUrl.hostname;
                pce.origin = responseUrl.origin;
                pce.data = response.data.products[0] || {};
                pceList.push(pce);
            });

            setProductCacheEntries(pceList);
        });
    }, [environmentConfig, tenant, sku, setProductCacheEntries]);

    function row(key) {
        const splitKey = key.replace(/([A-Z][a-z0-9])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase();});

        const inconsistent = new Set(productCacheEntries.map(
            e => String(e.data[key]).replace("/blueprint/servlet", ""))).size > 1;

        const valueRows = productCacheEntries.map(e => {
            const rawValue = e.data[key];
            const value = rawValue ? String(rawValue) : rawValue;

            if (key.includes("Stock")) {
                return <td key={e.hostname} className={"in-stock-" + value}>
                    {(value === "true") ? "✓" : "✗"}
                </td>
            }

            if (key === "imageURL" && value) {
                const url = e.origin + (value.startsWith("/blueprint/servlet") ? value : "/blueprint/servlet" + value);
                const fileName = value.split("/").pop();
                const id = value.match(/image\/(\d+)\//);
                return <td key={e.hostname}>
                    <img className="thumbnail" src={url} title={value} alt={value} />
                    <div className="file-name">{id}/{fileName}</div>
                </td>
            }
            else {
                return <td key={e.hostname}>{value}</td>
            }
        });

        return (
            <tr key={key} className={inconsistent ? "inconsistent": ""}>
                <td>{splitKey}</td>
                {valueRows}
            </tr>
        )
    }

    const headerRow = productCacheEntries?.map((e, i) => {
        const hostname = e.hostname;
        const name = (hostname === environmentConfig.previewHostname) ? "Preview" : hostname;
        return <th key={i}>{name}</th>;
    });

    const rowKeys = [
        //'productId',
        //'tenant',
        'productTitle',
        'drugName',
        'dosageTitle',
        'productLabel',
        'productGroup',
        'imageURL',
        'inStock',
        'currency',
        'price',
        'adminOutOfStock',
        'cmsProductOutOfStock',
        'cmsProductDosageOutOfStock',
        'cmsProductProxyOutOfStock',
        'cmsProxyAlgoOutOfStock',
        'salProductType',
        'hidden',
        'e24AlgorithmEnabled',
        'e24AlgorithmId',
        'cmsProductId',
        'cmsProductDosageId',
        'cmsProductProxyId',
        'packSize',
        'productType',
        'dosage',
        'proxyOverride',
        'prescriptionFrequency',
        'prescriptionFrequencyMode',
        'reviewFrequency',
        'reviewFrequencyMode',
        'drugType',
        'consultationFee',
        'consultationTitle',
    ];

    const rows = rowKeys?.map(k => row(k));

    return (
        <div className="Product" style={{"display": (sku ? "block" : "none")}}>
            <h1>{sku} - Product Information</h1>
            <button onClick={() => setSku(undefined)}>Return to Product List</button>
            <table className="product-information striped">
                <thead>
                    <tr>
                        <th/>
                        {headerRow}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    )
}

export default Product;
