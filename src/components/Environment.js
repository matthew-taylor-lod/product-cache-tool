import React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Tenant from "./Tenant";

function Environment({environmentConfig, tenantDetails, selectedTenant, setSelectedTenant, sku, setSku, filter, setFilter, sortBy, setSortBy}) {

    const tabs = environmentConfig.tenants.map(tenant =>
        <Tab key={tenant}>
            {tenantDetails[tenant].name}
        </Tab>
    );
    const tabPanels = environmentConfig.tenants.map(tenant =>
        <TabPanel key={tenant}>
            <Tenant tenant={tenant}
                    environmentConfig={environmentConfig}
                    sku={sku}
                    setSku={setSku}
                    filter={filter}
                    setFilter={setFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}/>
        </TabPanel>
    );

    const index = environmentConfig.tenants.indexOf(selectedTenant);

    return (
        <div className="Environment">
            <Tabs selectedIndex={index} onSelect={newIndex => setSelectedTenant(environmentConfig.tenants[newIndex])}>
                <TabList>{tabs}</TabList>
                {tabPanels}
            </Tabs>
        </div>
    )
}

export default Environment;
