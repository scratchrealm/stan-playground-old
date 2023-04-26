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

    const analyses = [...summary.analyses]
    // reverse the order of the analyses so that the most recent ones are at the top
    analyses.reverse()

    return (
        <div>
            <table className="scientific-table">
                <thead>
                    <tr>
                        <th>Analysis</th>
                        <th>Title</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>MCMC Monitor</th>
                        <th>Timestamp</th>
                        <th>Elapsed</th>
                        <th>Description</th>
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
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'analysis', analysisId: analysis.analysis_id})}>
                                    {analysis.title}
                                </Hyperlink>
                            </td>
                            <td>
                                {analysis.user_id || ''}
                            </td>
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
                            <td>
                                {createTimestampText(analysis)}
                            </td>
                            <td>
                                {createElapsedText(analysis)}
                            </td>
                            <td><span style={{fontSize: 11}}>{abbreviateString(removeFirstHeaderLineInMarkdown(analysis.description), 200)}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function removeFirstHeaderLineInMarkdown(text: string) {
    const lines = text.split('\n')
    if (lines.length === 0) return ''
    if (lines[0].startsWith('# ')) {
        return lines.slice(1).join('\n')
    }
    else {
        return text
    }
}

function abbreviateString(s: string, maxLength: number) {
    if (s.length <= maxLength) return s
    else return s.slice(0, maxLength) + '...'
}

function createTimestampText(analysis: Summary['analyses'][0]) {
    const status = analysis.status
    let ts: number | undefined
    if (status === 'queued') {
        ts = analysis.info.timestamp_queued
    }
    else if (status === 'running') {
        ts = analysis.info.timestamp_started
    }
    else if (status === 'completed') {
        ts = analysis.info.timestamp_completed
    }
    else if (status === 'failed') {
        ts = analysis.info.timestamp_failed
    }
    if (ts === undefined) return ''
    return timeAgoString(ts)
}
function createElapsedText(analysis: Summary['analyses'][0]) {
    const status = analysis.status
    let numSeconds: number | undefined
    if (status === 'completed') {
        numSeconds = (analysis.info.timestamp_completed || 0) - (analysis.info.timestamp_started || 0)
    }
    else if (status === 'failed') {
        numSeconds = (analysis.info.timestamp_failed || 0) - (analysis.info.timestamp_started || 0)
    }
    if (numSeconds === undefined) return ''
    return elapsedTimeString(numSeconds)
}


// thanks https://stackoverflow.com/a/6109105/160863 and gh copilot!
function timeAgoString(timestampSeconds: number) {
    const now = Date.now()
    const diff = now - timestampSeconds * 1000
    const diffSeconds = Math.floor(diff / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffWeeks / 4)
    const diffYears = Math.floor(diffMonths / 12)
    if (diffYears > 0) {
        return `${diffYears} yr${diffYears === 1 ? '' : 's'} ago`
    }
    else if (diffWeeks > 0) {
        return `${diffWeeks} wk${diffWeeks === 1 ? '' : 's'} ago`
    }
    else if (diffDays > 0) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    }
    else if (diffHours > 0) {
        return `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`
    }
    else if (diffMinutes > 0) {
        return `${diffMinutes} min ago`
    }
    else {
        return `${diffSeconds} sec ago`
    }
}

function elapsedTimeString(numSeconds: number) {
    numSeconds = Math.floor(numSeconds)
    const numMinutes = Math.floor(numSeconds / 60)
    const numHours = Math.floor(numMinutes / 60)
    const numDays = Math.floor(numHours / 24)
    const numWeeks = Math.floor(numDays / 7)
    const numMonths = Math.floor(numWeeks / 4)
    const numYears = Math.floor(numMonths / 12)
    if (numYears > 0) {
        return `${numYears} yr${numYears === 1 ? '' : 's'}`
    }
    else if (numWeeks > 5) {
        return `${numWeeks} wk${numWeeks === 1 ? '' : 's'}`
    }
    else if (numDays > 5) {
        return `${numDays} day${numDays === 1 ? '' : 's'}`
    }
    else if (numHours > 5) {
        return `${numHours} hr${numHours === 1 ? '' : 's'}`
    }
    else if (numMinutes > 5) {
        return `${numMinutes} min`
    }
    else {
        return `${numSeconds} sec`
    }
}

export default AnalysesTable