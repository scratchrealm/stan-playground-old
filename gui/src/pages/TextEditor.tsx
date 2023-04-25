import { Editor } from "@monaco-editor/react"
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { FunctionComponent, useCallback, useEffect, useState } from "react"

type Monaco = typeof monaco

type Props = {
    text: string | undefined
    defaultText?: string
    onSetText: (text: string) => void
    language: string
    readOnly?: boolean
    wordWrap?: boolean
    label: string
    width: number
    height: number
}

const TextEditor: FunctionComponent<Props> = ({text, defaultText, onSetText, readOnly, wordWrap, language, label, width, height}) => {
    const [internalText, setInternalText] = useState('')
    useEffect(() => {
        if (text !== undefined) {
            setInternalText(text)
        }
    }, [text])
    const handleChange = useCallback((value: string | undefined) => {
        setInternalText(value || '')
    }, [])
    const handleSave = useCallback(() => {
        onSetText(internalText)
    }, [internalText, onSetText])

    //////////////////////////////////////////////////
    // Seems that it is important to set the initial value of the editor
    // this way rather than using defaultValue. The defaultValue approach
    // worked okay until I navigated away and then back to the editors
    // and then everything was blank, and I couldn't figure out what
    // was causing this. But I think this method is more flexible anyway
    // is it gives us access to the editor instance.
    const [editor, setEditor] = useState<editor.IStandaloneCodeEditor | undefined>(undefined)
    useEffect(() => {
        if (!editor) return
        if (text === undefined) return
        editor.setValue(text || defaultText || '')
    }, [text, editor, defaultText])
    const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        setEditor(editor)
    }, [])
    /////////////////////////////////////////////////


    const toolbarHeight = 35
    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
            <div style={{position: 'absolute', paddingLeft: 20, paddingTop: 5, width, height: toolbarHeight, backgroundColor: 'lightgray'}}>
                {label}
                &nbsp;&nbsp;&nbsp;&nbsp;
                {!readOnly && <button disabled={text === internalText} onClick={handleSave}>save</button>}
                &nbsp;&nbsp;&nbsp;&nbsp;
                {readOnly && <span style={{color: 'gray'}}>read only</span>}
            </div>
            <div style={{position: 'absolute', top: toolbarHeight, width, height: height - toolbarHeight}}>
                <Editor
                    width={width}
                    height={height - toolbarHeight}
                    defaultLanguage={language}
                    onChange={handleChange}
                    onMount={handleEditorDidMount}
                    options={{
                        readOnly,
                        domReadOnly: readOnly,
                        wordWrap: wordWrap ? 'on' : 'off'
                    }}
                />
            </div>
        </div>
    )
}

export default TextEditor