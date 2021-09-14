import Tenant from "./tenants/Tenant";
import React from "react";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

function Environment({environmentConfig, tenantDetails, selectedTenant, setSelectedTenant}) {

    const tabs = environmentConfig.tenants.map(tenant =>
        <Tab>
            {tenantDetails[tenant].name}
        </Tab>
    );
    const tabPanels = environmentConfig.tenants.map((tenant, i) =>
        <TabPanel>
            <Tenant name={selectedTenant} environmentConfig={environmentConfig} key={i} />
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
