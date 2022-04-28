import React, {useEffect, useState} from "react";
import axios from "axios";
import {getProductData} from "../utils";
import ProductInformationRow from "./ProductInformationRow";
import("./ProductInformation.scss");

function ProductInformation({environmentConfig, tenant, sku, setSku}) {

    const [productCacheEntries, setProductCacheEntries] = useState([]);
    const [productData, setProductData] = useState({});

    const productCallSuffix = "/blueprint/servlet/eh/{tenant}/api/product/{sku}";

    useEffect(() => {

        const productCalls = Object.values(environmentConfig.servers).map(server => {
            const productsUrl = server + productCallSuffix.replace("{tenant}", tenant).replace("{sku}", sku);
            return axios.get(productsUrl,{crossdomain: true});
        });

        Promise.all(productCalls).then(responses => {
            const pceList = [];
            const consolidatedProductInformation = {};

            responses.forEach(response => {
                const responseUrl = new URL(response.config.url);

                const pce = {};
                pce.hostname = responseUrl.hostname;
                pce.origin = responseUrl.origin;
                pce.data = response.data.products[0] || {};
                pceList.push(pce);

                consolidatedProductInformation[pce.hostname] = pce.data;
            });

            setProductCacheEntries(pceList);
            setProductData(getProductData(consolidatedProductInformation, environmentConfig, tenant));
        });
    }, [environmentConfig, tenant, sku, setProductCacheEntries]);

    const headerRow = productCacheEntries?.map((e, i) => {
        const hostname = e.hostname;
        const name = (hostname === environmentConfig.previewHostname) ? "Preview" : hostname;
        return <th key={i}>{name}</th>;
    });

    const fields = [
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
        'existingActiveSubscriptionPageURL',
        'drugType',
        'consultationFee',
        'consultationTitle',
    ];

    const rows = fields?.map(field =>
        <ProductInformationRow key={field} field={field} productCacheEntries={productCacheEntries}/>);

    console.log(productData);

    return (
        <div className="ProductInformation" style={{"display": (sku ? "block" : "none")}}>
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

export default ProductInformation;
