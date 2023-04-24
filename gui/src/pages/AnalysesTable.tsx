import { FunctionComponent } from "react";
import Hyperlink from "../components/Hyperlink";
import useRoute from "../useRoute";
import './scientific-table.css';
import useAnalyses from "./useAnalyses";

type Props = {
    // none yet
}

const AnalysesTable: FunctionComponent<Props> = () => {
    const {analyses} = useAnalyses()
    const {setRoute} = useRoute()

    return (
        <div>
            <table className="scientific-table">
                <thead></thead>
                <tbody>
                    {analyses.map(analysis => (
                        <tr key={analysis.id}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'analysis', analysisId: analysis.id})}>
                                    {analysis.id}
                                </Hyperlink>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AnalysesTable