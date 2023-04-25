import { FunctionComponent } from "react";
import AnalysesTable from "./AnalysesTable";
import useSummary from "./useSummary";

type Props = {
    // none yet
}

const Home: FunctionComponent<Props> = () => {
    const summary = useSummary()
    return (
        <div style={{padding: 30}}>
            <h1>Stan playground</h1>
            <AnalysesTable summary={summary} />
        </div>
    )
}

export default Home