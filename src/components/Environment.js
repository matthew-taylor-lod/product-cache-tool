import ProductList from "./ProductList";
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function Environment({environmentConfig, tenantDetails, selectedTenant, setSelectedTenant, filter, setFilter, sortBy, setSortBy}) {

    const tabs = environmentConfig.tenants.map(tenant =>
        <Tab>
            {tenantDetails[tenant].name}
        </Tab>
    );
    const tabPanels = environmentConfig.tenants.map((tenant, i) =>
        <TabPanel>
            <ProductList tenant={selectedTenant}
                         environmentConfig={environmentConfig}
                         filter={filter}
                         setFilter={setFilter}
                         sortBy={sortBy}
                         setSortBy={setSortBy}
                         key={i} />
        </TabPanel>
    );

    const index = environmentConfig.tenants.indexOf(selectedTenant);

    return (
        <div className="Environment">
            <h1>{environmentConfig.name}</h1>
            <Tabs selectedIndex={index} onSelect={index => setSelectedTenant(environmentConfig.tenants[index])}>
                <TabList>
                    {tabs}
                </TabList>
                {tabPanels}
            </Tabs>
        </div>
    )
}

export default Environment;
