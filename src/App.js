import './App.scss';
import axios from 'axios';
import React, {useEffect, useState} from "react";
import EnvironmentSelector from "./environments/EnvironmentSelector";

function App() {
    const timestampArg = "?ts=" + new Date().getTime();

    const [config, setConfig] = useState({});

    useEffect(() => {
        const configPath = "config.json" + timestampArg;
        axios.get(configPath)
            .then(response => response.data)
            .then(json => setConfig(json));
    },[setConfig]);

    return (
        <>
            <div className="top">
                <div className="App">
                    <img src={process.env.PUBLIC_URL + "/logo.png"} alt="Logo"/>
                    Product Cache Tool
                </div>
            </div>
            <div className="App">
                <div className="inner">
                    <EnvironmentSelector config={config} timestampArg={timestampArg}/>
                </div>
            </div>
        </>
  );
}

export default App;
