import { readDir } from '@figurl/interface'
import { useEffect, useState } from "react"

type Analysis = {
    id: string
    path: string
}

const useAnalyses = () => {
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    useEffect(() => {
        (async () => {
            const a = await readDir('$dir/analyses')
            setAnalyses(
                a.dirs.map(dir => ({
                    id: dir.name || '',
                    path: `$dir/analyses/${dir.name || ''}`
                }))
            )
        })()
    }, [])
    return {
        analyses
    }
}

export default useAnalyses