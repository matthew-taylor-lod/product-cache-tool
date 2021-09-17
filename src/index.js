import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import {Route} from "react-router-dom";
import {QueryParamProvider} from "use-query-params";

const basename = (process.env.NODE_ENV === 'production') ? "/product-cache-tool" : ""

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter basename={basename}>
            <QueryParamProvider ReactRouterRoute={Route}>
                <App/>
            </QueryParamProvider>
        </BrowserRouter>
    </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
