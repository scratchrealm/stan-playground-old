import { Editor } from "@monaco-editor/react";
import { Refresh } from "@mui/icons-material";
import { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { FunctionComponent, PropsWithChildren, useCallback, useEffect, useState } from "react";
import Hyperlink from "../components/Hyperlink";

type Monaco = typeof monaco

type Props = {
    text: string | undefined
    defaultText?: string
    onSetText: (text: string) => void
    language: string
    readOnly?: boolean
    wordWrap?: boolean
    onReload?: () => void
    onModifiedChanged?: (modified: boolean) => void
    toolbarItems?: ToolbarItem[]
    label: string
    theme?: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'
    width: number
    height: number
}

export type ToolbarItem = {
    label: string
    onClick?: () => void
    color?: string
}

const TextEditor: FunctionComponent<Props> = ({text, defaultText, onSetText, readOnly, wordWrap, onReload, onModifiedChanged, toolbarItems, language, theme, label, width, height}) => {
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

    useEffect(() => {
        if (onModifiedChanged) {
            onModifiedChanged(text !== internalText)
        }
    }, [text, internalText, onModifiedChanged])

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
    }, [text, editor, defaultText, theme])
    const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        setEditor(editor)
    }, [])
    /////////////////////////////////////////////////


    const toolbarHeight = 25
    return (
        <div style={{position: 'absolute', width, height, overflow: 'hidden'}}>
            <NotSelectable>
                <div style={{position: 'absolute', paddingLeft: 20, paddingTop: 5, width, height: toolbarHeight, backgroundColor: 'lightgray'}}>
                    {label}
                    &nbsp;&nbsp;&nbsp;
                    {!readOnly && <Hyperlink disabled={text === internalText} onClick={handleSave} color="black">save</Hyperlink>}
                    &nbsp;&nbsp;&nbsp;
                    {readOnly && <span style={{color: 'gray'}}>read only</span>}
                    &nbsp;&nbsp;&nbsp;
                    {onReload && <LowerABit numPixels={2}><Hyperlink onClick={onReload} color="black"><Refresh style={{fontSize: 14}} /></Hyperlink></LowerABit>}
                    &nbsp;&nbsp;&nbsp;
                    {toolbarItems && toolbarItems.map((item, i) => (
                        <ToolbarItemComponent key={i} item={item} />
                    ))}
                </div>
            </NotSelectable>
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
                        wordWrap: wordWrap ? 'on' : 'off',
                        theme: theme || 'vs-dark' // unfortunately we cannot do this on a per-editor basis - it's a global setting
                    }}
                />
            </div>
        </div>
    )
}

const ToolbarItemComponent: FunctionComponent<{item: ToolbarItem}> = ({item}) => {
    const {onClick, color, label} = item
    if (!onClick) {
        return <span style={{color: color || 'gray'}}>{label}</span>
    }
    return (
        <Hyperlink onClick={onClick} color={color || 'gray'}>
            {label}
        </Hyperlink>
    )
}

const LowerABit: FunctionComponent<PropsWithChildren<{numPixels: number}>> = ({children, numPixels}) => {
    return (
        <span style={{position: 'relative', top: numPixels}}>
            {children}
        </span>
    )
}

const NotSelectable: FunctionComponent<PropsWithChildren> = ({children}) => {
    return (
        <div style={{userSelect: 'none'}}>
            {children}
        </div>
    )
}


export default TextEditor