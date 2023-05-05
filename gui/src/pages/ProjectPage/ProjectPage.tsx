import { useSignedIn } from "@figurl/interface";
import { FunctionComponent, useMemo } from "react";
import Splitter from "../../components/Splitter";
import TextEditor from "../TextEditor";
import ProjectPageMainSection from "./ProjectMainSection";
import useProjectData from "./useProjectData";

type Props = {
    projectId: string
    width: number
    height: number
}

const ProjectPage: FunctionComponent<Props> = ({projectId, width, height}) => {
    const initialEditorWidth = Math.max(500, width / 2)
    const {descriptionMdText, setDescriptionMdText, refreshDescriptionMdText, projectConfig} = useProjectData(projectId)

    const {userId} = useSignedIn()
    const canEdit = useMemo(() => {
        if (!projectConfig) return false
        if (!userId) return false
        if (projectConfig.owner_id === userId.toString()) return true
        for (const user of projectConfig.users) {
            if (user.user_id === userId.toString()) return true
        }
        return false
    }, [userId, projectConfig])

    return (
        <Splitter
            width={width}
            height={height}
            direction="horizontal"
            initialPosition={width - initialEditorWidth}
        >
            <ProjectPageMainSection
                projectId={projectId}
                width={0}
                height={0}
            />
            <TextEditor
                width={0}
                height={0}
                text={descriptionMdText}
                onSetText={setDescriptionMdText}
                language="markdown"
                readOnly={!canEdit}
                wordWrap={true}
                onReload={refreshDescriptionMdText}
                label="description.md"
            />
        </Splitter>
    )
}

export default ProjectPage