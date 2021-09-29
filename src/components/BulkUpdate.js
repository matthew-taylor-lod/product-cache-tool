import React, {useState} from "react";
import Modal from 'react-modal';

import("./BulkUpdate.scss");

function BulkUpdate({addProductsToLoadingQueue}) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");

    function openModal() {
        setOpen(true);
        setText("");
    }

    function changeText(event) {
        setText(event.target.value);
    }

    function update() {
        const tokens = new Set(text.split(/[\s,]+/));

        const validNumbers = [];

        tokens.forEach(t => {
            const num = Number(t);
            if (!isNaN(num)) {
                validNumbers.push(num);
            }
        })

        addProductsToLoadingQueue(validNumbers);
        setOpen(false);
    }

    return (
        <div className="BulkUpdate">
            <button onClick={() => openModal()}>
                Bulk Update
            </button>

            <Modal
                   isOpen={open}
                   className="BulkUpdateModal App">
                <div className="header">
                    <h1>Bulk Update</h1>
                    <button className="push" onClick={() => setOpen(false)}>Close</button>
                    <button onClick={() => update()}>Update All</button>
                </div>
                <p>
                    The bulk updater will scan the text below, extract any numbers, and update the cache using them as SKUs.
                    Other numbers, symbols or words will be ignored.
                </p>
                <textarea value={text} onChange={changeText}/>
            </Modal>
        </div>
    )
}

export default BulkUpdate;
