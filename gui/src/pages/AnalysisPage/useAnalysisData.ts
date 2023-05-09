import { getFileData, serviceQuery, useSignedIn } from "@figurl/interface"
import YAML from 'js-yaml'
import { useCallback, useEffect, useMemo, useState } from "react"
import { alert } from "../../confirm_prompt_alert"
import { useStatusBar } from "../../StatusBar/StatusBarContext"
import { getLocalStorageAnalysisEditToken } from "../localStorageAnalyses"

export type AnalysisInfo = {
    status: 'none' | 'queued' | 'running' | 'completed' | 'failed'
    error?: string
    owner_id?: string
    project_id?: string
    timestamp_created?: number
    timestamp_modified?: number
    timestamp_queued?: number
    timestamp_started?: number
    timestamp_completed?: number
    timestamp_failed?: number
    listed?: boolean
}

export const useAnalysisTextFile = (analysisId: string, analysisInfo: AnalysisInfo | undefined, name: string) => {
    const [internalText, setInternalText] = useState<string | undefined>(undefined)
    const [refreshCode, setRefreshCode] = useState(0)
    useEffect(() => {
        (async () => {
            setInternalText(undefined)
            try {
                const a = await readTextFile(`$dir/analyses/${analysisId}/${name}`)
                setInternalText(a)
            }
            catch (err) {
                console.warn(err)
                setInternalText('')
            }
        })()
    }, [analysisId, name, refreshCode])
    const refresh = useCallback(() => {
        setRefreshCode(c => (c + 1))
    }, [])
    const {userId} = useSignedIn()
    const setText = useCallback((text: string) => {
        (async () => {
            if ((analysisInfo?.owner_id) && (analysisInfo.owner_id !== userId?.toString())) {
                await alert(`You cannot edit this file because it is owned by by ${analysisInfo.owner_id}.`)
                return
            }
            await serviceQuery('stan-playground', {
                type: 'set_analysis_text_file',
                analysis_id: analysisId,
                name,
                text,
                edit_token: getLocalStorageAnalysisEditToken(analysisId)
            }, {
                includeUserId: true
            })
            setRefreshCode(c => (c + 1))
        })()
    }, [analysisId, name, analysisInfo, userId])
    return {text: internalText, refresh, setText}
}

const useAnalysisData = (analysisId: string) => {
    const {text: analysisInfoText, refresh: refreshAnalysisInfo} = useAnalysisTextFile(analysisId, undefined, 'analysis.yaml')
    const analysisInfo = useMemo(() => {
        if (!analysisInfoText) return undefined
        try {
            return YAML.load(analysisInfoText) as AnalysisInfo
        }
        catch (err) {
            console.warn('Problem loading yaml')
            console.warn(err)
            return undefined
        }
    }, [analysisInfoText])

    const {text: dataJsonText, setText: setDataJsonText, refresh: refreshDataJsonText} = useAnalysisTextFile(analysisId, analysisInfo, 'data.json')
    const {text: mainStanText, setText: setMainStanText, refresh: refreshMainStanText} = useAnalysisTextFile(analysisId, analysisInfo, 'main.stan')
    const {text: descriptionMdText, setText: setDescriptionMdText, refresh: refreshDescriptionMdText} = useAnalysisTextFile(analysisId, analysisInfo, 'description.md')
    const {text: optionsYamlText, setText: setOptionsYamlText, refresh: refreshOptionsYamlText} = useAnalysisTextFile(analysisId, analysisInfo, 'options.yaml')
    const {text: dataPyText, setText: setDataPyText, refresh: refreshDataPyText} = useAnalysisTextFile(analysisId, analysisInfo, 'data.py')

    const {setStatusBarMessage} = useStatusBar()

    const {userId} = useSignedIn()

    const setStatus = useCallback((status: string) => {
        (async () => {
            if ((analysisInfo?.owner_id) && (analysisInfo.owner_id !== userId?.toString())) {
                await alert(`You cannot perform this action because this analysis is owned by by ${analysisInfo.owner_id}.`)
                return
            }
            try {
                const {result} = await serviceQuery('stan-playground', {
                    type: 'set_analysis_status',
                    analysis_id: analysisId,
                    status,
                    edit_token: getLocalStorageAnalysisEditToken(analysisId)
                }, {
                    includeUserId: true
                })
                if (!result.success) {
                    throw new Error(result.error)
                }
            }
            catch(err: any) {
                setStatusBarMessage(err.message)
                await alert(err.message)
            }
            finally {
                refreshAnalysisInfo()
            }
        })()
    }, [analysisId, refreshAnalysisInfo, setStatusBarMessage, userId, analysisInfo?.owner_id])
    
    return {
        mainStanText,
        dataJsonText,
        descriptionMdText,
        optionsYamlText,
        dataPyText,
        analysisInfo,
        setMainStanText,
        setDataJsonText,
        setDescriptionMdText,
        setOptionsYamlText,
        setDataPyText,
        refreshMainStanText,
        refreshDataJsonText,
        refreshDescriptionMdText,
        refreshOptionsYamlText,
        refreshDataPyText,
        setStatus,
        refreshAnalysisInfo
    }
}

const readTextFile = async (path: string) => {
    const a = await getFileData(path, () => {}, {responseType: 'text'})
    return a as string
}

export default useAnalysisData