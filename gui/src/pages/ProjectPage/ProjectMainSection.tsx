import { serviceQuery, useSignedIn } from "@figurl/interface";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import Hyperlink from "../../components/Hyperlink";
import useRoute from "../../useRoute";
import AnalysesTable, { getTitleFromMarkdown } from "../AnalysesTable";
import useProjectData from "./useProjectData";
import {Summary} from "../useSummary"
import { useStatusBar } from "../../StatusBar/StatusBarContext";
import { AnalysisInfo } from "../AnalysisPage/useAnalysisData";
import { confirm } from "react-alert-async";

type Props = {
    projectId: string
    width: number
    height: number
}

type ProjectAnalysis = {
    analysis_id: string
    config: AnalysisInfo
    description: string
}

const ProjectPageMainSection: FunctionComponent<Props> = ({projectId, width, height}) => {
    // important to do this here just once rather than separately in the various editors
    const {descriptionMdText, setDescriptionMdText, refreshDescriptionMdText, projectConfig, refreshProjectConfig} = useProjectData(projectId)

    const projectTitle = getTitleFromMarkdown(descriptionMdText || '')

    const {setStatusBarMessage} = useStatusBar()

    const [refreshAnalysesCode, setRefreshAnalysesCode] = useState(0)
    const refreshAnalyses = useCallback(() => {setRefreshAnalysesCode(c => c + 1)}, [])
    const [analyses, setAnalyses] = useState<ProjectAnalysis[]>()
    useEffect(() => {
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'get_project_analyses',
                project_id: projectId
            }, {
                includeUserId: true
            })
            if (!result.success) {
                setStatusBarMessage(`Failed to get project analyses.`)
                return
            }
            setAnalyses(result.analyses)
        })()
    }, [projectId, setStatusBarMessage, refreshAnalysesCode])

    const {setRoute} = useRoute()

    const summary: Summary = useMemo(() => {
        return {
            analyses: (analyses || []).map(a => ({
                analysis_id: a.analysis_id,
                title: getTitleFromMarkdown(a.description),
                status: a.config.status,
                owner_id: a.config.owner_id,
                data_size: 0,
                info: a.config,
                description: a.description,
                stan_program: '',
                options: {}
            }))
        }
    }, [analyses])

    const handleCreateNewAnalysis = useCallback(() => {
        (async () => {
            // Confirm that user wants to create a new analysis
            if (!await confirm('Create a new analysis in this project?')) return
            const {result} = await serviceQuery('stan-playground', {
                type: 'create_analysis',
                project_id: projectId
            }, {
                includeUserId: true
            })
            if (!result.success) {
                setStatusBarMessage(`Failed to create new analysis.`)
                return
            }
            if (!result.newAnalysisId) throw new Error('Unexpected - no new analysis id')
            refreshAnalyses()
            setTimeout(() => {
                setStatusBarMessage(`New analysis has been created.`)
            }, 500)
        })()
    }, [refreshAnalyses, projectId, setStatusBarMessage])

    const handleMakeProjectListed = useCallback((val: boolean) => {
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: 'set_project_listed',
                project_id: projectId,
                listed: val
            }, {
                includeUserId: true
            })
            if (!result.success) {
                setStatusBarMessage(`Failed to modify project listing status: ${result.error}`)
                return
            }
            refreshProjectConfig()
            setTimeout(() => {
                setStatusBarMessage(val ? `Project is now listed.` : `Project is no longer listed.`)
            }, 500)
        })()
    }, [projectId, setStatusBarMessage, refreshProjectConfig])

    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{padding: 20}}>
                <div><Hyperlink onClick={() => setRoute({page: 'home'})}>&#8592; Home</Hyperlink></div>
                <h2>Project: {projectTitle} ({projectId})</h2>
                <table>
                    <tbody>
                        <tr>
                            <td style={{fontWeight: 'bold'}}>Owner:</td>
                            <td>{projectConfig?.owner_id}</td>
                        </tr>
                        <tr>
                        <td style={{fontWeight: 'bold'}}>Users:</td>
                            <td>{projectConfig?.users.map(u => u.user_id).join(', ')}</td>
                        </tr>
                    </tbody>
                </table>
                {
                    projectConfig && !projectConfig.listed && (
                        <div>
                            This project is not publicly listed. <Hyperlink onClick={() => {handleMakeProjectListed(true)}}>List this project.</Hyperlink>
                        </div>
                    )
                }
                {
                    projectConfig && projectConfig.listed && (
                        <div>
                            This project is publicly listed. <Hyperlink onClick={() => {handleMakeProjectListed(false)}}>Unlist this project.</Hyperlink>
                        </div>
                    )
                }
                <hr />
                <div style={{paddingBottom: 10}}>
                    <Hyperlink onClick={handleCreateNewAnalysis}>Create new analysis</Hyperlink>
                </div>
                <AnalysesTable
                    summary={summary}
                />
            </div>
        </div>
    )
}

export default ProjectPageMainSection