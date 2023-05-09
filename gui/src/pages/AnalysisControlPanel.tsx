import { getFileData, serviceQuery } from "@figurl/interface"
import { FunctionComponent, useCallback, useEffect, useState } from "react"
import Hyperlink from "../components/Hyperlink"
import { useStatusBar } from "../StatusBar/StatusBarContext"
import useRoute from "../useRoute"
import { addLocalStorageAnalysis, deleteLocalStorageAnalysis, getLocalStorageAnalysisEditToken } from "./localStorageAnalyses"
import { AnalysisInfo } from "./AnalysisPage/useAnalysisData"
import useProjectData from "./ProjectPage/useProjectData"
import { getTitleFromMarkdown } from "./AnalysesTable"
import { userId } from "@figurl/interface/dist/viewInterface/kacheryTypes"
import { confirm, prompt } from "../confirm_prompt_alert"

type Props = {
    analysisId: string
    analysisInfo: AnalysisInfo | undefined
    canEdit: boolean
    onRefreshAnalysisInfo: () => void
    onQueueRun: () => void
    onDeleteRun: () => void
    width: number
    height: number
}

const deleteAnalysisTooltip = `When you delete an analysis, it is flagged as deleted on the server and it will not show up on the list of analyses. This operation can be undone.`
const cloneAnalysisTooltip = `When you clone an analysis, a new analysis is created with the same model, scripts, settings, etc. However, the run will be empty.`

const AnalysisControlPanel: FunctionComponent<Props> = ({analysisId, canEdit, analysisInfo, onRefreshAnalysisInfo, onQueueRun, onDeleteRun}) => {
    const {setRoute} = useRoute()
    const {setStatusBarMessage} = useStatusBar()
    const status = analysisInfo !== undefined ? analysisInfo?.status || 'none' : 'undefined'
    const mcmcMonitorBaseUrl = useMcmcMonitorBaseUrl()

    const handleListAnalysis = useCallback(() => {
        (async() => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'set_analysis_listed',
                analysis_id: analysisId,
                listed: true,
                edit_token: getLocalStorageAnalysisEditToken(analysisId)
            }, {
                includeUserId: true
            })
            if (result.success) {
                setTimeout(() => {
                    // provide a popup box that says that the analysis has been deleted
                    setStatusBarMessage(`Analysis has been listed.`)
                }, 500)
                onRefreshAnalysisInfo()
            }
            else {
                alert(`Failed to list analysis: ${result.error}`)
            }
        })()
    }, [analysisId, setStatusBarMessage, onRefreshAnalysisInfo])

    const handleUnlistAnalysis = useCallback(() => {
        (async() => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'set_analysis_listed',
                analysis_id: analysisId,
                listed: false,
                edit_token: getLocalStorageAnalysisEditToken(analysisId)
            }, {
                includeUserId: true
            })
            if (result.success) {
                setTimeout(() => {
                    // provide a popup box that says that the analysis has been deleted
                    setStatusBarMessage(`Analysis has been listed.`)
                }, 500)
                onRefreshAnalysisInfo()
            }
            else {
                alert(`Failed to list analysis: ${result.error}`)
            }
        })()
    }, [analysisId, setStatusBarMessage, onRefreshAnalysisInfo])

    const projectId = analysisInfo?.project_id || ''

    const {descriptionMdText: projectDescription} = useProjectData(projectId)

    const handleClone = useCallback(() => {
        (async() => {
            // prompt the user if they are sure they want to clone this analysis
            if (!await confirm('Are you sure you want to CLONE this analysis?')) return
            const originalProjectId = projectId
            const {result} = await serviceQuery('stan-playground', {
                type: 'clone_analysis',
                analysis_id: analysisId
            }, {
                includeUserId: true
            })
            if (!result.success) {
                alert(`Failed to clone analysis: ${result.error}`)
                return
            }
            addLocalStorageAnalysis({analysisId: result.newAnalysisId, editToken: result.editToken})
            setTimeout(() => {
                // provide a popup box that says that the analysis has been clone and you are not viewing the clone
                setStatusBarMessage(`Analysis has been cloned. You are now viewing the clone.`)
                if ((originalProjectId) && (userId)) {
                    (async() => {
                        if (await confirm('Do you want to set the project of the clone to the same project as the original?')) {
                            const {result: result2} = await serviceQuery('stan-playground', {
                                type: 'set_analysis_project',
                                analysis_id: result.newAnalysisId,
                                project_id: originalProjectId
                            }, {
                                includeUserId: true
                            })
                            if (!result2.success) {
                                alert(`Failed to move analysis to the same project as the original: ${result.error}`)
                            }
                        }
                        setRoute({page: 'analysis', analysisId: result.newAnalysisId})
                    })()
                }
                else {
                    setRoute({page: 'analysis', analysisId: result.newAnalysisId})
                }
            }, 500)
        })()
    }, [analysisId, setRoute, setStatusBarMessage, projectId])

    const handleDelete = useCallback(() => {
        // prompt the user if they are sure they want to delete this analysis
        (async() => {
            if (!confirm('Are you sure you want to DELETE this analysis?')) return
            const {result} = await serviceQuery('stan-playground', {
                type: 'delete_analysis',
                analysis_id: analysisId,
                edit_token: getLocalStorageAnalysisEditToken(analysisId)
            }, {
                includeUserId: true
            })
            if (result.success) {
                deleteLocalStorageAnalysis(analysisId)
                if (projectId) {
                    setRoute({page: 'project', projectId})
                }
                else {
                    setRoute({page: 'home'})
                }
                setTimeout(() => {
                    // provide a popup box that says that the analysis has been deleted
                    setStatusBarMessage(`Analysis has been deleted.`)
                }, 500)
            }
            else {
                alert(`Failed to delete analysis: ${result.error}`)
            }
        })()
    }, [analysisId, setRoute, setStatusBarMessage, projectId])

    const handleAddToAProject = useCallback(() => {
        (async() => {
            // prompt the user for the project id
            const projectId = await prompt('Enter the project ID to add this analysis to:')
            if (!projectId) return
            const {result} = await serviceQuery('stan-playground', {
                type: 'set_analysis_project',
                analysis_id: analysisId,
                project_id: projectId,
            }, {
                includeUserId: true
            })
            if (!result.success) {
                alert(`Failed to add analysis to project: ${result.error}`)
                return
            }
            onRefreshAnalysisInfo()
        })()
    }, [analysisId, onRefreshAnalysisInfo])

    return (
        <div style={{paddingLeft: 15, paddingTop: 15, fontSize: 14, userSelect: 'none'}}>
            <div>
                {
                    projectId ? (
                        <Hyperlink onClick={() => setRoute({page: 'project', projectId})}>&#8592; Back to project</Hyperlink>
                    ) : (
                        <Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Home</Hyperlink>
                    )
                }
            </div>
            <hr />
            <div>Analysis: {analysisId}</div>
            <div>Status: <span style={{color: colorForStatus(status)}}>{status}</span> (<Hyperlink onClick={onRefreshAnalysisInfo}>refresh</Hyperlink>)</div>
            <hr />
            <div>{status === 'none' && (
                <span>
                    <p>
                        This analysis has not been run.
                    </p>
                    <p><Hyperlink onClick={onQueueRun}>Queue run</Hyperlink></p>
                </span>
            )}</div>
            <div>{status === 'queued' && (
                <span>
                    <p>
                        This analysis has been queued to run.
                        {canEdit && " You can cancel this run by clicking the Cancel button below."}
                    </p>
                    <p><Hyperlink onClick={onDeleteRun}>Cancel run</Hyperlink></p>
                </span>
            )}</div>
            <div>{status === 'running' && (
                <span>
                    <p>
                        This analysis is running.
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>Monitor the progress using <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <div>{status === 'completed' && (
                <span>
                    <p>
                        This analysis has completed.
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>View the output in <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                    <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
                </span>
            )}</div>
            <div>{status === 'failed' && (
                <span>
                    <p>
                        An error has occurred while running this analysis.
                        {canEdit && " You can delete this run using the button below."}
                    </p>
                    {
                        canEdit && (
                            <Hyperlink onClick={onDeleteRun}>Delete run</Hyperlink>
                        )
                    }
                    <p style={{color: 'red', wordWrap: 'break-word'}}>
                        {analysisInfo?.error}
                    </p>
                    {
                        mcmcMonitorBaseUrl ? (
                            <p>You can <a href={createMcmcMonitorUrl(mcmcMonitorBaseUrl, analysisId)} target="_blank" rel="noreferrer">view the output if there is any using MCMC Monitor</a></p>
                        ) : (
                            <p>MCMC Monitor URL is not found in output/mcmc-monitor-url.txt</p>
                        )
                    }
                </span>
            )}</div>
            <hr />
            {
                projectId && projectDescription ? (
                    <div>
                        Part of project: <Hyperlink onClick={() => setRoute({page: 'project', projectId})}>{getTitleFromMarkdown(projectDescription || '')}</Hyperlink>
                    </div>
                ) : (
                    <div>
                        Not part of a project. <Hyperlink onClick={handleAddToAProject}>Add to a project.</Hyperlink>
                    </div>
                )
            }
            <hr />
            {
                analysisInfo?.listed ? (
                    <p>
                        This is analysis is public.&nbsp;
                        {
                            canEdit && (
                                <Hyperlink onClick={handleUnlistAnalysis}>Unlist this analysis</Hyperlink>
                            )
                        }
                    </p>
                ) : (
                    <p>
                        This is analysis is not public.&nbsp;
                        {
                            canEdit && (
                                <Hyperlink onClick={handleListAnalysis}>List this analysis</Hyperlink>
                            )
                        }
                    </p>
                )
            }
            <hr />
            {/* A clickable link to clone this analysis: */}
            <div style={{lineHeight: 2}} title={cloneAnalysisTooltip}><Hyperlink onClick={handleClone}>Clone this analysis</Hyperlink></div>
            {/* A clickable link to delete this analysis: */}
            {
                canEdit && (
                    <div style={{lineHeight: 2}} title={deleteAnalysisTooltip}><Hyperlink color="darkred" onClick={handleDelete}>Delete this analysis</Hyperlink></div>
                )
            }
        </div>
    )
}

const colorForStatus = (status: string) => {
    switch (status) {
        case 'none': return 'gray'
        case 'queued': return 'orange'
        case 'running': return 'blue'
        case 'completed': return 'green'
        case 'failed': return 'red'
        default: return 'black'
    }
}

export const useMcmcMonitorBaseUrl = () => {
    const [mcmcMonitorUrl, setMcmcMonitorUrl] = useState<string | undefined>(undefined)
    useEffect(() => {
        (async () => {
            const a = await getFileData(`$dir/output/mcmc-monitor-url.txt`, () => {}, {responseType: 'text'})
            if (!a) {
                setMcmcMonitorUrl(undefined)
                return
            }
            setMcmcMonitorUrl(a)
        })()
    }, [])
    return mcmcMonitorUrl
}


export const createMcmcMonitorUrl = (mcmcMonitorBaseUrl: string, analysisId: string) => {
    if (!mcmcMonitorBaseUrl) return undefined
    return `${mcmcMonitorBaseUrl}#/run/${analysisId}`
}

export default AnalysisControlPanel