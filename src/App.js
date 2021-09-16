import './App.scss';
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Environment from "./components/Environment";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

function App() {
    const timestampArg = "?ts=" + new Date().getTime();

    const [config, setConfig] = useState(null);
    const [selectedTenant, setSelectedTenant] = useQueryParam("tenant", StringParam);
    const [selectedEnvironment, setSelectedEnvironment] = useQueryParam("env", StringParam);

    const [sortBy, setSortBy] = useQueryParam("sortBy", StringParam);
    const [filter, setFilter] = useQueryParam("filter", StringParam);

    if (!sortBy) setSortBy("name");

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

    if (!config) {
        return null;
    }

    const tabs = config.environments.map(e => <Tab><h1>{e.name}</h1></Tab>);

    const tabPanels = config.environments.map(e =>
        <TabPanel>
            <Environment
                environmentConfig={e}
                tenantDetails={config.tenants}
                selectedTenant={selectedTenant}
                setSelectedTenant={setSelectedTenant}
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}/>
        </TabPanel>
    );

    const environmentList = config.environments.map(e => e.name);
    const index = environmentList.indexOf(selectedEnvironment);

    return (
        <>
            <div className="top" onClick={() =>{
                setSelectedEnvironment(config.defaultEnvironment);
                setSelectedTenant(config.defaultTenant);
                setFilter("");
                setSortBy("");
            }}>
                <div className="App">
                    <img src={process.env.PUBLIC_URL + "/logo.png"} alt="Logo"/>
                    Product Cache Tool
                </div>
            </div>
            <div className="App">
                <div className="inner">
                    <Tabs className="environment-selector" selectedIndex={index} onSelect={newIndex => setSelectedEnvironment(environmentList[newIndex])}>
                        <TabList>{tabs}</TabList>
                        {tabPanels}
                    </Tabs>
                </div>
            </div>
        </>
  );
}

export default App;
