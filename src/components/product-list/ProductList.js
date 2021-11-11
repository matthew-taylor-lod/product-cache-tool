import ProductListRow from "./ProductListRow";
import {sortingMethods} from "../utils";
import BulkUpdate from "./BulkUpdate";
import React from "react";
import("./ProductList.scss");

function ProductList({productMap, loadingQueueLookup, addProductsToLoadingQueue, sku, setSku, filter, setFilter, sortBy, setSortBy}) {

    function updateAll() {
        const sortedFilteredProducts = Object.values(productMap)
            .filter(filterFunction)
            .sort(getSortingFunction());

        const skus = sortedFilteredProducts.map(e => e.sku);

        addProductsToLoadingQueue(skus);
    }

    function filterFunction(product) {
        if (!filter) return true;
        if (loadingQueueLookup.has(product.sku)) return true;

        const filterValues = filter.split(",").map(e => e.trim().toUpperCase()).filter(e => e.length > 0);

        if (filterValues.length === 0) return true;

        let pass = false;

        filterValues.forEach(filterValue => {
            if (product.filterableString && product.filterableString.includes(filterValue)) {
                pass = true;
            }
        });

        return pass;
    }

    function getSortingFunction() {
        const sortingMethod = sortingMethods[sortBy];
        return (sortingMethod) ? sortingMethod.sort : sortingMethods["sku"].sort;
    }

    function isSortBySelected(name) {
        return (sortBy === name) ? "selected" : "";
    }

    const sortedFilteredProducts = Object.values(productMap)
        .filter(filterFunction)
        .sort(getSortingFunction());

    const productListRows = sortedFilteredProducts.map((product) => {
        return <ProductListRow key={product.sku}
                               product={product}
                               isLoading={loadingQueueLookup.has(product.sku)}
                               addProductsToLoadingQueue={addProductsToLoadingQueue}
                               setSku={setSku}
                               setFilter={setFilter}/>
    });

    const showing = productListRows.length;
    const total = Object.values(productMap).length;

    return (
        <div className="ProductList" style={{"display": (sku ? "none" : "block")}}>
            <h1>Registered Products</h1>
            <div className="tools">
                <div className="filter">
                    <span>Filter by</span>
                    <div className="filter-box">
                        <input className="filter-input"
                               placeholder="type here to filter table"
                               value={filter}
                               onChange={e => setFilter(e.target.value)}/>
                        <div className="filter-clear" onClick={() => setFilter("") }>
                            clear
                        </div>
                    </div>
                    <span>Showing {showing} of {total}</span>
                </div>
                <div className="sort-by">
                    <span>Sort by </span>
                    <button className={isSortBySelected("v_name")} onClick={() => setSortBy("v_name")}>Name, visible first</button>
                    <span> / </span>
                    <button className={isSortBySelected("name")} onClick={() => setSortBy("name")}>Name</button>
                    <span> / </span>
                    <button className={isSortBySelected("sku")} onClick={() => setSortBy("sku")}>SKU</button>
                </div>
                <BulkUpdate addProductsToLoadingQueue={addProductsToLoadingQueue}/>
            </div>

            {productListRows.length > 0 &&
                <table className="striped">
                    <thead>
                        <tr>
                            <th className="min">SKU</th>
                            <th>Name</th>
                            <th className="min">CMS Product</th>
                            <th className="min">Group</th>
                            <th className="min">Algo</th>
                            <th className="min">Price</th>
                            <th colSpan={1} className="min">In Stock</th>
                            <th colSpan={2} className="min">Preview</th>
                            <th className="min"><button onClick={() => updateAll()}>Update All</button></th>
                        </tr>
                    </thead>
                    <tbody>
                    {productListRows}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default ProductList;
