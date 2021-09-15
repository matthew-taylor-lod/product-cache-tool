export function getProductName(product) {
    return product.productTitle
        ? product.productTitle
        : product.dosageTitle + " " + product.productLabel;
}

export const sortingMethods = {
    sku: {
        name: "sku",
        sort: (a, b) => a.productId - b.productId
    },
    name: {
        name: "name",
        sort:(a, b) => getProductName(a).localeCompare(getProductName(b))
    }
};

