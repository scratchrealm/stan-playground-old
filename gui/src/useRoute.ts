import { useUrlState } from "@figurl/interface"
import { useCallback, useMemo } from "react"

export type Route = {
    page: 'home'
} | {
    page: 'analysis'
    analysisId: string
}

const useRoute = () => {
    const {urlState, updateUrlState} = useUrlState()
    const route: Route = useMemo(() => {
        const p = urlState['path'] || ''
        if (p.startsWith('/analysis/')) {
            const a = p.split('/')
            const analysisId = a[2]
            return {
                page: 'analysis',
                analysisId
            }
        }
        else {
            return {
                page: 'home'
            }
        }
    }, [urlState])

    const setRoute = useCallback((r: Route) => {
        if (r.page === 'home') {
            updateUrlState({path: '/'})
        }
        else if (r.page === 'analysis') {
            updateUrlState({path: `/analysis/${r.analysisId}`})
        }
    }, [updateUrlState])

    return {
        route,
        setRoute
    }    
}

export default useRoute