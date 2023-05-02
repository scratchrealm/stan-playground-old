import { getFileData } from "@figurl/interface"
import { useCallback, useEffect, useState } from "react"
import { AnalysisInfo } from "./useAnalysisData"

export type Summary = {
    analyses: {
        analysis_id: string
        title: string
        status: string
        owner_id?: string
        data_size: number
        info: AnalysisInfo
        description: string
        stan_program: string
        options: any
    }[]
}

const useSummary = () => {
    const [summary, setSummary] = useState<Summary | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        setSummary(undefined)
        ;(async () => {
            const s = await getFileData(`$dir/stan_playground_summary.json`, () => {}, {responseType: 'json'})
            setSummary(s)
        })()
    }, [refreshCode])

    const refreshSummary = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])

    return {summary, refreshSummary}
}

export default useSummary