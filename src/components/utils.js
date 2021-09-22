export function getProductData(consolidatedProductInformation, environmentConfiguration, tenant) {

    // get the preview data and remove it from the map
    const previewProductInformation = consolidatedProductInformation[environmentConfiguration.previewHostname];
    const deliveryData = Object.values(consolidatedProductInformation).filter(e => e !== previewProductInformation);

    let productInformation = previewProductInformation;
    let deliveryInconsistent = false;

    if (deliveryData.length > 0) {
        productInformation = Object.values(deliveryData)[0];
        deliveryInconsistent = !deliveryData.every(productCacheEntry => flatMapEqual(productCacheEntry, productInformation, (noOp => noOp)));
    }

    const product = {};
    product["tenant"] = tenant;
    product["sku"] = productInformation["productId"] || previewProductInformation["sku"];

    // data from the delivery product information
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

    // get the preview data
    if (previewProductInformation && previewProductInformation["cmsProductId"]) {
        product["previewInStock"] = previewProductInformation.inStock;
        product["adminOutOfStock"] = previewProductInformation.adminOutOfStock;
        product["cmsProxyAlgoOutOfStock"] = previewProductInformation.cmsProxyAlgoOutOfStock;
        product["cmsProductOutOfStock"] = previewProductInformation.cmsProductOutOfStock;
        product["cmsProductDosageOutOfStock"] = previewProductInformation.cmsProductDosageOutOfStock;
        product["cmsProductProxyOutOfStock"] = previewProductInformation.cmsProductProxyOutOfStock;

        product["unpublishedChanges"] = !flatMapEqual(productInformation, previewProductInformation,
            (v => String(v).replace(/\/blueprint\/servlet/, "")));
    }
    else {
        product["previewMissing"] = true;
        product["previewInStock"] = product["inStock"];
    }

    // flags
    product["deliveryMissing"] = (deliveryData.length !== environmentConfiguration.deliveryServers) || !productInformation["cmsProductId"];
    product["deliveryInconsistent"] = deliveryInconsistent;

    // get filterable data
    const filterableFields = [
        product.sku,
        product.name,
        product.cmsProductId,
        product.productGroup,
        product.e24AlgorithmId,
        (product.hidden) ? "hidden" : "",
        (product.unpublishedChanges) ? "!unpublished-changes" : "",
        (product.previewMissing) ? "!preview-missing" : "",
        (product.deliveryMissing) ? "!delivery-missing" : "",
        (product.deliveryInconsistent) ? "!delivery-inconsistent" : "",


    ];

    product["filterableString"] = filterableFields.join("\n").toUpperCase();

    return product;
}

export function flatMapEqual(entry1, entry2, valueFunction) {
    const keys1 = Object.keys(entry1);
    const keys2 = Object.keys(entry2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (valueFunction(entry1[key]) !== valueFunction(entry2[key])) {
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

