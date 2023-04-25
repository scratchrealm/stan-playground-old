import { getFileData, readDir, serviceQuery } from "@figurl/interface"
import { useCallback, useEffect, useState } from "react"
import YAML from 'js-yaml'

type AnalysisData = {
    modelStanText?: string
    dataJsonText?: string
    descriptionMdText?: string
    optionsYamlText?: string
    analysisInfo?: AnalysisInfo
}

export type AnalysisInfo = {
    status: 'none' | 'requested' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
}

const useAnalysisData = (analysisId: string) => {
    const [analysisData, setAnalysisData] = useState<AnalysisData | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            const a = await readDir(`$dir/analyses/${analysisId}`)
            const hasDataJson = a.files.find(f => f.name === 'data.json') ? true : false
            const hasModelStan = a.files.find(f => f.name === 'model.stan') ? true : false
            const hasDescriptionMd = a.files.find(f => f.name === 'description.md') ? true : false
            const hasOptionsYaml = a.files.find(f => f.name === 'options.yaml') ? true : false
            const hasAnalysisYaml = a.files.find(f => f.name === 'analysis.yaml') ? true : false
            const modelStanText = hasModelStan ? await readTextFile(`$dir/analyses/${analysisId}/model.stan`) : ''
            const dataJsonText = hasDataJson ? await readTextFile(`$dir/analyses/${analysisId}/data.json`) : ''
            const descriptionMdText = hasDescriptionMd ? await readTextFile(`$dir/analyses/${analysisId}/description.md`) : ''
            const optionsYamlText = hasOptionsYaml ? await readTextFile(`$dir/analyses/${analysisId}/options.yaml`) : ''
            const analysisYaml = hasAnalysisYaml ? await readTextFile(`$dir/analyses/${analysisId}/analysis.yaml`) : ''
            const analysisInfo = loadYaml(analysisYaml) as AnalysisInfo
            setAnalysisData({
                modelStanText,
                dataJsonText,
                descriptionMdText,
                optionsYamlText,
                analysisInfo
            })
        })()
    }, [analysisId, refreshCode])
    const setModelStanText = useCallback((text: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name: 'model.stan',
                text
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId])
    const setDataJsonText = useCallback((text: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name: 'data.json',
                text
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId])
    const setDescriptionMdText = useCallback((text: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name: 'description.md',
                text
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId])
    const setOptionsYamlText = useCallback((text: string) => {
        (async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name: 'options.yaml',
                text
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId])
    const setStatus = useCallback((status: string) => {
        if (!['requested', 'none'].includes(status)) throw Error(`Not able to set status: ${status}`)
        ;(async () => {
            await serviceQuery('stan-playground', {
                type: 'set_analysis_status',
                analysis_id: analysisId,
                status
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId])
    return {
        modelStanText: analysisData?.modelStanText,
        dataJsonText: analysisData?.dataJsonText,
        descriptionMdText: analysisData?.descriptionMdText,
        optionsYamlText: analysisData?.optionsYamlText,
        analysisInfo: analysisData?.analysisInfo,
        setModelStanText,
        setDataJsonText,
        setDescriptionMdText,
        setOptionsYamlText,
        setStatus
    }
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

const loadYaml = (text: string) => {
    try {
        return YAML.load(text) || {}
    }
    catch (err) {
        console.warn('Problem loading yaml')
        console.warn(err)
        return {}
    }
}

export default useAnalysisData