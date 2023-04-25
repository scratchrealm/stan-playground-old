import { getFileData } from "@figurl/interface"
import { useCallback, useEffect, useState } from "react"

export type Summary = {
    analyses: {
        analysis_id: string
        title: string
        status: string
        data_size: number
        info: {
            status: string
            error?: string
            timestamp_queued?: number
            timestamp_started?: number
            timestamp_completed?: number
            timestamp_failed?: number
        }
        description: string
        stan_program: string
        options: any
    }[]
}

const useSummary = () => {
    const [summary, setSummary] = useState<Summary>({analyses: []})
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            const s = await getFileData(`$dir/summary.json`, () => {}, {responseType: 'json'})
            setSummary(s)
        })()
    }, [refreshCode])

    const refreshSummary = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    return {summary, refreshSummary}
}

export default useSummary