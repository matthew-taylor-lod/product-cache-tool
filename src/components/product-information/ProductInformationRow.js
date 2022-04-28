import React from "react";

function ProductInformationRow({field, productCacheEntries}) {
    const splitKey = field.replace(/([A-Z][a-z0-9])/g, ' $1')
        .replace(/^./, function(str){ return str.toUpperCase();});

    const inconsistent = new Set(productCacheEntries.map(
        pce => String(pce.data[field]).replace("/blueprint/servlet/page", "").replace("/blueprint/servlet", ""))).size > 1;

    const valueRows = productCacheEntries.map(
        pce => <ProductInformationTd key={pce.hostname}
                                     field={field}
                                     rawValue={pce.data[field]}
                                     hostname={pce.hostname}
                                     origin={pce.origin}/>);

    return (
        <tr className={inconsistent ? "inconsistent": ""}>
            <td>{splitKey}</td>
            {valueRows}
        </tr>
    )
}

function ProductInformationTd({field, rawValue, hostname, origin}) {
    const value = rawValue !== null ? String(rawValue) : rawValue;

    if (field.includes("Stock")) {
        return <td key={hostname} className={"in-stock-" + value}>
            {(value === "true") ? "✓" : "✗"}
        </td>
    }

    if (field === "imageURL" && value) {
        const url = origin + (value.startsWith("/blueprint/servlet") ? value : "/blueprint/servlet" + value);
        const fileName = value.split("/").pop();
        const matchedId = value.match(/image\/(\d+)\//);
        const id = (matchedId && matchedId.length > 1) ? matchedId[1] : "";
        return <td key={hostname}>
            <img className="thumbnail" src={url} title={value} alt={value}/>
            <div className="file-name">{id}/{fileName}</div>
        </td>
    }
    if (field === "existingActiveSubscriptionPageURL" && value) {
        const valueMinusPrefix = value.replace("/blueprint/servlet/page", "");
        return <td key={hostname}>{valueMinusPrefix}</td>
    }
    else {
        return <td key={hostname}>{value}</td>
    }
}

export default ProductInformationRow;
