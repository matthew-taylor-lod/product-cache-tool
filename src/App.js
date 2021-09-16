import './App.scss';
import axios from 'axios';
import React, {useEffect, useState} from "react";
import Environment from "./components/Environment";
import {useQueryParam} from "use-query-params";
import {StringParam} from "serialize-query-params";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

function App() {
    const [config, setConfig] = useState(null);
    const [selectedTenant, setSelectedTenant] = useQueryParam("tenant", StringParam);
    const [selectedEnvironment, setSelectedEnvironment] = useQueryParam("env", StringParam);

    const [sortBy, setSortBy] = useQueryParam("sortBy", StringParam);
    const [filter, setFilter] = useQueryParam("filter", StringParam);

    useEffect(() => {
        const timestampArg = "?ts=" + new Date().getTime();
        const configPath = "config.json" + timestampArg;
        axios.get(configPath)
            .then(response => response.data)
            .then(json => {
                setConfig(json);

            });
    },[setConfig]);

    useEffect(() => {
        if (config) {
            if (!selectedEnvironment) {
                setSelectedEnvironment(config.defaultEnvironment);
            }
            if (!selectedTenant) {
                setSelectedTenant(config.defaultTenant);
            }
            if (!sortBy) {
                setSortBy(config.defaultSortBy)
            }
        }
    }, [config, selectedEnvironment, setSelectedEnvironment, selectedTenant, setSelectedTenant, sortBy, setSortBy])

    if (!config) {
        return null;
    }

    const tabs = config.environments.map(e =>
        <Tab key={e.name} disabled={e.hidden === true && selectedEnvironment !== e.name}>
            <h1>{e.name}</h1>
        </Tab>);

    const tabPanels = config.environments.map(e =>
        <TabPanel key={e.name}>
            <Environment
                environmentConfig={e}
                tenantDetails={config.tenants}
                selectedTenant={selectedTenant}
                setSelectedTenant={setSelectedTenant}
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />
        </TabPanel>
    );

    const environmentList = config.environments.map(e => e.name);
    const index = environmentList.indexOf(selectedEnvironment);

    return (
        <>
            <div className="top" onClick={() =>{
                setSelectedEnvironment("");
                setSelectedTenant("");
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
