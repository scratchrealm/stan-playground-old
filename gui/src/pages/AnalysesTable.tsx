import { FunctionComponent } from "react";
import Hyperlink from "../components/Hyperlink";
import useRoute from "../useRoute";
import { createMcmcMonitorUrl, useMcmcMonitorBaseUrl } from "./AnalysisControlPanel";
import './scientific-table.css';
import { Summary } from "./useSummary";

type Props = {
    summary: Summary
}

const AnalysesTable: FunctionComponent<Props> = ({summary}) => {
    const {setRoute} = useRoute()

    const mcmcMonitorBaseUrl = useMcmcMonitorBaseUrl()

    const analyses = summary.analyses

    return (
        <div>
            <table className="scientific-table">
                <thead>
                    <tr>
                        <th>Analysis</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>MCMC Monitor</th>
                    </tr>
                </thead>
                <tbody>
                    {analyses.map(analysis => (
                        <tr key={analysis.analysis_id}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'analysis', analysisId: analysis.analysis_id})}>
                                    {analysis.analysis_id}
                                </Hyperlink>
                            </td>
                            <td>{analysis.title}</td>
                            <td>{analysis.status}</td>
                            <td>
                                {
                                    mcmcMonitorBaseUrl ? (
                                        ['running', 'completed', 'failed'].includes(analysis.status) ? (
                                            <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysis.analysis_id)} target="_blank" rel="noreferrer">MCMC Monitor</a>
                                        ) : <span />
                                    ) : <span />
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AnalysesTable