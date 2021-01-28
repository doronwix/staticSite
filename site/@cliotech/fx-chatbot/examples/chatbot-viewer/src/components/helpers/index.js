import React from 'react'
import logger from '../../lib/logger'

const Message = ({ message }) => {
    return <div className="message">{message}</div>
}

const Error = ({ message }) => {
    logger.log('!error!!!', message)
    return <div className="error">{message}</div>
}

const AgentList = ({ agents, onCancel, onDownload }) => {
    return (
        <div className="prompt">
            <div className="form">
                {(data => {
                    let d = {}
                    data.forEach(agent => {
                        if (d[`${agent.name}_${agent.version}_${agent.language}`] == null)
                            d[`${agent.name}_${agent.version}_${agent.language}`] = agent

                        if (
                            agent.version >
              d[`${agent.name}_${agent.version}_${agent.language}`].version
                        )
                            d[`${agent.name}_${agent.version}_${agent.language}`].version =
                agent.version
                        d[`${agent.name}_${agent.version}_${agent.language}`] = agent
                    })
                    let output = []
                    Object.entries(d).forEach(entry => {
                        output.push(
                            <div
                                onClick={onDownload}
                                data-id={entry[1]._id}
                                className="row agent"
                            >{`${entry[1].name} (${entry[1].language}) v.${entry[1].version}`}</div>
                        )
                    })
                    return output.length === 0 ? (
                        <div className="row">Could not find agents</div>
                    ) : (
                        output
                    )
                })(agents)}
            </div>
            <div className="buttons">
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    )
}
const Prompt = ({ onCancel, onUpload }) => {
    const idRef = React.createRef()
    const nameRef = React.createRef()
    const versionRef = React.createRef()
    const languageRef = React.createRef()
    const passwordRef = React.createRef()
    const onSubmit = () => {
        let fields = []
        let hasErrors = false

        fields.push([idRef.current, idRef.current.value === ''])
        fields.push([nameRef.current, nameRef.current.value === ''])
        fields.push([languageRef.current, languageRef.current.value === ''])
        fields.push([versionRef.current, versionRef.current.value === ''])
        fields.push([passwordRef.current, passwordRef.current.value === ''])

        fields.forEach(field => {
            field[0].classList.remove('fieldError')
            if (field[1]) {
                field[0].classList.add('fieldError')
                hasErrors = true
            }
        })

        if (!hasErrors)
            onUpload(
                idRef.current.value,
                nameRef.current.value,
                versionRef.current.value,
                languageRef.current.value,
                passwordRef.current.value
            )
    }

    let agentFromLS = localStorage.getItem('agent')
    if (agentFromLS != null) agentFromLS = JSON.parse(agentFromLS)
    else agentFromLS = { id: '', name: '', version: 1, language: 'en' }

    return (
        <div className="prompt">
            <div className="form">
                <div className="row">
                    <div className="label">Id:</div>
                    <div className="value">
                        <input
                            type="text"
                            className="id"
                            ref={idRef}
                            defaultValue={agentFromLS.id}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="label">Name:</div>
                    <div className="value">
                        <input
                            type="text"
                            className="name"
                            ref={nameRef}
                            defaultValue={agentFromLS.name}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="label">Version:</div>
                    <div className="value">
                        <input
                            type="number"
                            className="version"
                            ref={versionRef}
                            defaultValue={agentFromLS.version}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="label">Language:</div>
                    <div className="value">
                        <input
                            type="text"
                            className="language"
                            ref={languageRef}
                            defaultValue={agentFromLS.language}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="label">Password:</div>
                    <div className="value">
                        <input type="password" className="password" ref={passwordRef} />
                    </div>
                </div>
            </div>
            <div className="buttons">
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onSubmit}>Upload</button>
            </div>
        </div>
    )
}

export { Message, Error, AgentList, Prompt}