import { FunctionComponent } from "react";
import AnalysesTable from "./AnalysesTable";

type Props = {
    // none yet
}

const Home: FunctionComponent<Props> = () => {
    return (
        <div style={{padding: 30}}>
            <h1>Stan playground</h1>
            <h3>Analyses</h3>
            <AnalysesTable />
        </div>
    )
}

export default Home