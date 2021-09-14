import React from "react";
import {StringParam, useQueryParam} from "use-query-params";
import Environment from "./Environment";
import("./EnvironmentSelector.scss");

function EnvironmentSelector({config}) {

    const [selectedEnv, setSelectedEnv] = useQueryParam("env", StringParam);
    const [selectedTenant, setSelectedTenant] = useQueryParam("tenant", StringParam);

    const environments = config.environments?.map((e, i) => <Environment config={config} environmentConfig={e} key={i} />);

    return (
        <div className="EnvironmentSelector">
            {environments}
        </div>
    )
}

export default EnvironmentSelector;
