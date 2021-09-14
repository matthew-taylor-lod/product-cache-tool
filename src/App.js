import './App.scss';
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Environment from "./environments/Environment";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";

function App() {
    const timestampArg = "?ts=" + new Date().getTime();

    const [config, setConfig] = useState(null);
    const [selectedTenant, setSelectedTenant] = useQueryParam("tenant", StringParam);
    const [selectedEnvironment, setSelectedEnvironment] = useQueryParam("env", StringParam);

    useEffect(() => {
        const configPath = "config.json" + timestampArg;
        axios.get(configPath)
            .then(response => response.data)
            .then(json => {
                setConfig(json);
                if (!selectedEnvironment) {
                    setSelectedEnvironment(json.defaultEnvironment);
                }
                if (!selectedTenant) {
                    setSelectedTenant(json.defaultTenant);
                }
            });
    },[setConfig, setSelectedEnvironment, setSelectedTenant]);

    const environments = config?.environments.filter(e => e.name === selectedEnvironment).map(e =>
        <Environment environmentConfig={e} tenantDetails={config.tenants} selectedTenant={selectedTenant} setSelectedTenant={setSelectedTenant} />
    );

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
                    { environments }
                </div>
            </div>
        </>
  );
}

export default App;
