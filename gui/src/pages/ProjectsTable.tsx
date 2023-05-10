import { serviceQuery } from "@figurl/interface";
import { FunctionComponent, useEffect, useState } from "react";
import Hyperlink from "../components/Hyperlink";
import { useStatusBar } from "../StatusBar/StatusBarContext";
import useRoute from "../useRoute";
import { abbreviateString, getTitleFromMarkdown, removeFirstHeaderLineInMarkdown, timeAgoString } from "./AnalysesTable";
import './scientific-table.css';

type Props = {
    mode: 'listed' | 'user'
}

type Project = {
    project_id: string
    config: {
        owner_id: string
        users: {user_id: string}[]
        listed?: boolean
        timestamp_created: number
        timestamp_modified: number
    }
    description: string
}

const ProjectsTable: FunctionComponent<Props> = ({mode}) => {
    const [projects, setProjects] = useState<Project[]>()
    const {setStatusBarMessage} = useStatusBar()
    useEffect(() => {
        (async () => {
            const {result} = await serviceQuery('stan-playground', {
                type: mode === 'listed' ? 'get_listed_projects' : 'get_projects_for_user',
            }, {
                includeUserId: true
            })
            if (!result.success) {
                setStatusBarMessage(`Failed to get projects.`)
                return
            }
            setProjects(result.projects)
        })()
    }, [mode, setStatusBarMessage])

    const [takingLongerThanExpected, setTakingLongerThanExpected] = useState(false)
    useEffect(() => {
        const a = setTimeout(() => {
            setTakingLongerThanExpected(true)
        }, 2500)
        return () => {
            clearTimeout(a)
        }
    }, [])

    const {setRoute} = useRoute()

    if ((takingLongerThanExpected) && (!projects)) {
        return <span>Taking longer than expected to load projects.</span>
    }

    if (!projects) {
        return <span>Loading projects...</span>
    }

    return (
        <div>
            <table className="scientific-table">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Owner</th>
                        <th>Users</th>
                        <th>Listed</th>
                        <th>Created</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        <tr key={project.project_id}>
                            <td>
                                <Hyperlink onClick={() => setRoute({page: 'project', projectId: project.project_id})}>
                                    {getTitleFromMarkdown(project.description)}
                                </Hyperlink>
                            </td>
                            <td>
                                {project.config.owner_id}
                            </td>
                            <td>
                                {project.config.users.map(u => u.user_id).join(', ')}
                            </td>
                            <td>
                                {project.config.listed ? 'listed' : 'unlisted'}
                            </td>
                            <td>
                                {timeAgoString(project.config.timestamp_created)}
                            </td>
                            <td><span style={{fontSize: 11}}>{abbreviateString(removeFirstHeaderLineInMarkdown(project.description), 200)}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ProjectsTable