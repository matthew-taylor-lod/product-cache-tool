export function getProductName(product) {
    return product.productTitle
        ? product.productTitle
        : product.dosageTitle + " " + product.productLabel;
}
