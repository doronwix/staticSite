/* eslint no-console: 0 */
import React, { Component } from 'react'
// import { JsonEditor as Editor } from 'jsoneditor-react'
import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'

import Blocks from './components/editor/blocks'
// import Container from './components/container'
import {ChatBot} from '@cliotech/fx-chatbot'
import { Message, Error, AgentList, Prompt } from './components/helpers'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './App.css'

import {
    faSave, faEye, faTrash, faFileExport, faFileImport, // faUndo, faProjectDiagram,
    faTimes, faUpload, faDownload
} from '@fortawesome/free-solid-svg-icons'
import 'jsoneditor-react/es/editor.min.css'
import { api } from './api'

import basicTreeReal from './data/PersonalGuide/maxsa_1_en.json'
const  header = {name:'Give as a feedback'}//, slogan:'bla bla bla..'}
// import basicTreeReal from './data/max_6_en.json'

let bubbleMessageIndex = basicTreeReal.findIndex(function (m) { return !!m.emilyMessage })
if (0 <= bubbleMessageIndex) {
    basicTreeReal.splice(bubbleMessageIndex, 1)
}

const basicTree = [
    {
        id: 1,
        messages: [
            {
                type: 'text',
                text: 'hello',
                for: 1
            },
            {
                type: 'text',
                text: 'world'
            }
        ]
    }
]

const treeFromMemory = window.localStorage.getItem('json')
const defaultTree = treeFromMemory ? JSON.parse(treeFromMemory) : basicTreeReal || basicTree

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            blocks: defaultTree,
            latestJson: defaultTree,
            selectedBlock: null,
            unsavedJson: null,
            startBlockId: 10,
            id: Math.random(),
            exporting: false,
            importing: false,
            diagram: false,
            prompt: null
        }
        this.jsonField = React.createRef()
        this.exportTextareaRef = React.createRef()
        this.uploadJsonButtonRef = React.createRef()

        this.chatBotInstance = null
    }

    componentDidMount() {
        const { blocks, selectedBlock } = this.state
        let latestJson = blocks.find(block => block.id === selectedBlock)
        if (!latestJson) {
            latestJson = blocks[0]
            this.setState({ latestJson, selectedBlock: blocks[0].id })
        } else {
            this.setState({ latestJson })
        }

        this.chatBotInstance = ChatBot(defaultTree, 
                {
                    onLoad:() => { console.log('onLoad', arguments) },
                    onError: this.showError.bind(this),
                    onTrack: (type, name, data) => console.info('onTrack', type, name, data),
                    onCallback: data => console.info('onCallback:', data),
                }, 
                document.getElementById('emily-container')
            )
    }

    saveJson() {
        try {
            const { latestJson } = this.state
            this.setState({ error: null, blocks: latestJson, id: Math.random() })
        } catch (e) {
            this.setState({ error: e.message })
        }
    }

    resetJson(json) {
        const { unsavedJson } = this.state

        json = json || unsavedJson

        if (json != null && json.length > 0) {
            window.localStorage.removeItem('json')
            this.setState({
                error: null,
                blocks: json,
                latestJson: json[0],
                selectedBlock: json[0].id,
                id: Math.random(),
                importing: false
            })
            window.localStorage.setItem('json', JSON.stringify(json))
        }
    }

    textareaChanged(e) {
        try {
            let json = JSON.parse(e.target.value)
            this.setState({ unsavedJson: json })
        } catch (e) {
            console.error(e.message)
            this.setState({ error: e.message })
        }
    }

    jsonChanged(obj) {
        if (obj.jsObject) {
            this.setState({ unsavedJson: obj.jsObject })
        }
    }

    showError(error) {
        this.setState({ error })
    }

    selectBlock(id, type) {
        const { blocks } = this.state
        let blockId = id !== null ? (id.data ? id.data.id : id) : null

        if (blockId === null) {
            let maxBlockId = 0
            let json = blocks.map(block => {
                if (block.id > maxBlockId) maxBlockId = block.id
                return block
            })
            maxBlockId += 1
            let newBlock = { id: maxBlockId, messages: [] }

            switch (type) {
            case 'text': { 
                newBlock.messages.push({ type: 'text', text: 'text goes here...' })
                break
            }
            case 'video': {
                newBlock.messages.push({
                    type: 'video',
                    thumbnail: '',
                    url: '',
                    grace: 5,
                    goto: 100
                })
                break
            }
            case 'choices': {
                newBlock.messages.push({
                    type: 'choices',
                    choices: [
                        {
                            id: 1000,
                            type: 'button',
                            text: 'First choice',
                            postback: 'This is the text of the first choice',
                            goto: 100
                        },
                        {
                            id: 1001,
                            type: 'buton',
                            text: 'Second choice',
                            postback: 'This is the text of the second choice',
                            goto: 101
                        }
                    ]
                })
                break
            }
            case 'quiz': {
                newBlock.messages.push({
                    type: 'quiz',
                    text: 'how much is 2 + 2?',
                    choices: [
                        {
                            id: 1,
                            type: 'button',
                            text: '4',
                            correct: true
                        },
                        {
                            id: 2,
                            type: 'button',
                            text: '5',
                            correct: false
                        },
                        {
                            id: 3,
                            type: 'button',
                            text: '6',
                            correct: false
                        }
                    ],
                    response: {
                        correct: {
                            type: 'text',
                            text: 'That is correct!',
                            goto: 100
                        },
                        wrong: {
                            type: 'text',
                            text: 'That is wrong',
                            goto: 101
                        }
                    }
                })
                break
            }
            default: {
                newBlock = { type: '' }
            }
            }
            json.push(newBlock)
            this.setState({
                selectedBlock: maxBlockId,
                latestJson: newBlock,
                blocks: json
            })
            window.localStorage.setItem('json', JSON.stringify(json))
        } else {
            this.setState({
                selectedBlock: blockId,
                latestJson: blocks.find(block => block.id === blockId)
            })
        }
    }

    updateId(blocks, oldId, newId) {
        return blocks.map(block => {
            let b = { ...block }
            b.messages = block.messages.map(message => {
                if (typeof message === 'string') return message
                else if (message instanceof Array) return message

                let m = { ...message }
                if (m.goto === oldId) m.goto = newId
                if (m.blockId === oldId) m.blockId = newId
                if (m.choices) {
                    if (m.response) {
                        if (m.response.correct.goto === oldId)
                            m.response.correct.goto = newId
                        if (m.response.wrong.goto === oldId) m.response.wrong.goto = newId
                    } else {
                        m.choices = m.choices.map(choice => {
                            if (choice.goto === oldId) return { ...choice, goto: newId }
                            else return choice
                        })
                    }
                }
                return m
            })
            return b
        })
    }

    saveBlock() {
        const { selectedBlock, unsavedJson, blocks } = this.state
        if (unsavedJson === null) return

        let block = blocks.find(b => b.id === unsavedJson.id)
        if (block != null && selectedBlock !== unsavedJson.id) {
            alert(`Block #${unsavedJson.id} already exists!`)
            return
        }

        let json = blocks.map(block => {
            if (block.id === unsavedJson.id) return unsavedJson || block
            else if (block.id === selectedBlock) return null
            else return block
        }).filter(b => b)

        if (block == null) json.push(unsavedJson)

        if (selectedBlock !== unsavedJson.id)
            json = this.updateId(json, selectedBlock, unsavedJson.id)

        this.setState(
            {
                blocks: json.sort((a, b) => (a.id > b.id ? 1 : -1))
            },
            () => {
                this.selectBlock(unsavedJson.id)
            }
        )
        window.localStorage.setItem('json', JSON.stringify(json))
    }

    deleteBlock() {
        if (window.confirm('Are you sure you want to delete this block?')) {
            const { selectedBlock, blocks } = this.state
            let json = blocks
                .map(block => {
                    if (block.id === selectedBlock) return null
                    else return block
                })
                .filter(a => a)

            this.setState({
                blocks: json,
                latestJson: json.length > 0 ? json[0] : null
            })
            if (json.length > 0) this.selectBlock(json[0].id)

            window.localStorage.setItem('json', JSON.stringify(json))
        }
    }

    startFromBlock() {
        const { selectedBlock } = this.state
        this.setState({
            error: null,
            startBlockId: selectedBlock,
            id: Math.random()
        })
    }

    toggleExport() {
        const { exporting } = this.state
        this.setState({ exporting: !exporting, error: null })
    }

    toggleDiagram() {
        const { diagram } = this.state
        this.setState({ diagram: !diagram })
    }

    toggleReset() {
        const { importing } = this.state
        this.setState({ importing: !importing, error: null })
    }

    prepareUploadJson() {
        try {
            let blocks = JSON.parse(this.exportTextareaRef.current.value)
            this.setState({ error: null, prompt: true })
        } catch (e) {
            this.setState({ error: e.message })
        }
    }

    uploadJson(id, name, version, language, password) {
        this.setState({ status: 'loading' })

        api.post('/set', {
            id,
            name,
            version,
            language,
            password,
            content: this.exportTextareaRef.current.value
        }).then(response => {
            if (response.data.error) {
                this.setState({
                    error: typeof response.data.error === 'string' ?
                        response.data.error : response.data.error.message
                })
            } else {
                this.setState(
                    {
                        message: `Agent '${name}' version ${version} saved successfuly`,
                        error: null,
                        prompt: null
                    },
                    () => {
                        window.setTimeout(() => {
                            this.setState({ message: null })
                        }, 3000)
                    }
                )
            }
                    
        }).catch(error => {
            this.setState({ prompt: null, error: error.message })
            console.error(error)
        })
    }

    loadAgents() {
        api.get('/get').then(response => {
            if (response.data.error)
                this.setState({ error: response.data.error.message })
            else {
                this.setState({ prompt: true, agents: response.data.results })
            }
        }).catch(error => {
            this.setState({ error: error.message })
        })
    }

    cancelDownloadJson() {
        this.setState({ prompt: false })
    }

    downloadJson(e) {
        const { agents } = this.state

        this.setState({ prompt: false })
        let agentId = e.target.getAttribute('data-id')
        let agent = agents.find(agent => agent._id === agentId)

        this.setState({ agent })

        localStorage.setItem('agent', JSON.stringify({
            id: agent.id,
            name: agent.name,
            version: agent.version,
            language: agent.language
        }))

        this.resetJson(
            typeof agent.content === 'string' ?
                JSON.parse(agent.content) : agent.content
        )
    }

    cancelUploadJson() {
        this.setState({ prompt: false })
    }

    render() {
        const {
            blocks, error, message, raw, id, latestJson, selectedBlock,
            startBlockId, exporting, importing, diagram, prompt, agents
        } = this.state

        return (
            <div className="container">
                { exporting ? (
                    <React.Fragment>
                        <div className="fullscreen">
                            <div className="fullscreen-title"> The following code represents the current flow: </div>
                            <textarea ref={this.exportTextareaRef}
                                defaultValue={JSON.stringify(blocks, null, 2)}
                            />
                        </div>
                        <div className="button-container">
                            <button onClick={this.toggleExport.bind(this)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <button className="right" ref={this.uploadJsonButtonRef}
                                onClick={this.prepareUploadJson.bind(this)}>
                                <FontAwesomeIcon icon={faUpload} />
                            </button>
                            { prompt && (<Prompt onCancel={this.cancelUploadJson.bind(this)}
                                              onUpload={this.uploadJson.bind(this)}/>) }
                        </div>
                        { error && <Error message={error} /> }
                        { message && <Message message={message} /> }
                    </React.Fragment>
                ) : importing ? (
                    <React.Fragment>
                        <div className="fullscreen">
                            <div className="fullscreen-title">Paste here the JSON you want to load into the editor: </div>
                            <textarea defaultValue={JSON.stringify(basicTree, null, 2)}
                                onChange={this.textareaChanged.bind(this)} />
                            { error && <div className="error">{error}</div> }
                        </div>
                        <div className="button-container">
                            <button onClick={() => this.resetJson()}>
                                <FontAwesomeIcon icon={faSave} />
                            </button>
                            <button onClick={this.toggleReset.bind(this)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                            <button onClick={this.loadAgents.bind(this)}>
                                <FontAwesomeIcon icon={faDownload} />
                            </button>
                            { prompt && (
                                <AgentList agents={agents}
                                    onCancel={this.cancelDownloadJson.bind(this)}
                                    onDownload={this.downloadJson.bind(this)}
                                />
                            ) }
                        </div>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Blocks selected={selectedBlock}
                            data={blocks}
                            onSelect={this.selectBlock.bind(this)}
                            diagram={diagram}
                        />
                        {/* <Editor value={blocks} onChange={this.handleChange} />  */}
                        <JSONInput id="json-editor" placeholder={latestJson} locale={locale} waitAfterKeyPress={1000}
                            onChange={this.jsonChanged.bind(this)} />
                        <div className="button-container">
                            <button onClick={this.saveBlock.bind(this)}>
                                <FontAwesomeIcon icon={faSave} />
                            </button>
                            <button onClick={this.startFromBlock.bind(this)}>
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                            <button className="delete" onClick={this.deleteBlock.bind(this)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button className="reset" onClick={this.toggleReset.bind(this)}>
                                <FontAwesomeIcon icon={faFileImport} />
                            </button>
                            <button className="reset" onClick={this.toggleExport.bind(this)}>
                                <FontAwesomeIcon icon={faFileExport} />
                            </button>
                            {/* <button className="reset" onClick={this.toggleDiagram.bind(this)}>
                                <FontAwesomeIcon icon={faProjectDiagram} />
                            </button> */}
                        </div>
                        {error && <div className="error">{error}</div>}
                        <div className="emily_container" id="emily-container">
                            {/* <Container
                                key={`chat_${id}`}
                                blocks={blocks}
                                startBlockId={startBlockId}
                                history={true}
                                active={true}
                                onLoad={() => { console.log('onLoad', arguments) }}
                                onError={this.showError.bind(this)}
                                onTrack={(type, name, data) => console.info('onTrack', type, name, data)}
                                onCallback={data => console.info('onCallback:', data)}
                                header={header}
                            /> */}
                        </div>
                    </React.Fragment>
                )}
            </div>
        )
    }
}

export default App
