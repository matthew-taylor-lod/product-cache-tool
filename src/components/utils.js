export function getProductData(consolidatedProductInformation, environmentConfiguration, tenant) {

    // get the preview data and remove it from the map
    const previewData = consolidatedProductInformation[environmentConfiguration.previewHostname];
    const deliveryData = Object.values(consolidatedProductInformation).filter(e => e !== previewData);

    let productInformation = previewData;
    let deliveryInconsistent = false;

    if (deliveryData.length > 0) {
        productInformation = Object.values(deliveryData)[0];
        deliveryInconsistent &= deliveryData.every(productCacheEntry => flatMapEqual(productCacheEntry, productInformation));
    }

    const product = {};
    product["tenant"] = tenant;
    product["deliveryMissing"] = (deliveryData.length !== environmentConfiguration.deliveryServers) || !productInformation["cmsProductId"];
    product["deliveryConsistent"] = !deliveryInconsistent;

    product["sku"] = productInformation["productId"] || previewData["sku"];
    product["name"] = productInformation.productTitle
        ? productInformation.productTitle
        : productInformation.dosageTitle + " " + productInformation.productLabel;
    product["hidden"] = productInformation.hidden;
    product["cmsProductId"] = productInformation.cmsProductId;
    product["productGroup"] = productInformation.productGroup?.toLowerCase();

    product["e24AlgorithmId"] = productInformation.e24AlgorithmId !== 0
        ? productInformation.e24AlgorithmId
        : "";

    product["price"] = productInformation.price !== -1
        ? productInformation.currency + Number(productInformation.price).toFixed(2)
        : ""

    product["inStock"] = productInformation.inStock;

    if (previewData && previewData["cmsProductId"]) {
        product["previewInStock"] = previewData.inStock;
        product["adminOutOfStock"] = previewData.adminOutOfStock;
        product["cmsProxyAlgoOutOfStock"] = previewData.cmsProxyAlgoOutOfStock;
        product["cmsProductOutOfStock"] = previewData.cmsProductOutOfStock;
        product["cmsProductDosageOutOfStock"] = previewData.cmsProductDosageOutOfStock;
        product["cmsProductProxyOutOfStock"] = previewData.cmsProductProxyOutOfStock;
    }
    else {
        product["previewMissing"] = true;
        product["previewInStock"] = product["inStock"];
    }

    // get filterable data
    const filterableFields = [
        product.sku,
        product.name,
        product.cmsProductId,
        product.productGroup,
        product.e24AlgorithmId
    ];

    product["filterableString"] = filterableFields.join("\n").toUpperCase();

    return product;
}

export function flatMapEqual(entry1, entry2) {
    const keys1 = Object.keys(entry1);
    const keys2 = Object.keys(entry2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (entry1[key] !== entry2[key]) {
            return false;
        }
    }

    return true;
}

export const sortingMethods = {
    sku: {
        name: "sku",
        sort: (a, b) => a.productId - b.productId
    },
    name: {
        name: "name",
        sort:(a, b) => a.name.localeCompare(b.name)
    }
};

