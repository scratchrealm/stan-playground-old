import { getFileData } from "@figurl/interface"
import { useEffect, useState } from "react"

export type Summary = {
    analyses: {
        analysis_id: string
        title: string
        status: string
        data_size: number
        info: {
            status: string
            error?: string
        }
        description: string
        stan_program: string
        options: any
    }[]
}

const useSummary = () => {
    const [summary, setSummary] = useState<Summary>({analyses: []})
    useEffect(() => {
        (async () => {
            const s = await getFileData(`$dir/summary.json`, () => {}, {responseType: 'json'})
            setSummary(s)
        })()
    }, [])

    return summary
}

export default useSummary