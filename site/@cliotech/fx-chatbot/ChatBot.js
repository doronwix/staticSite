import '@babel/polyfill'
import ReactDOM from 'react-dom'
import React from 'react'

import Container from './src/components/container'

const ChatBot = (data, options, element) => {
    const m = { data, options, element }

    const logException = (data) => {
        if (m.options.onError)
            m.options.onError(data)
        // else
        //     throw (data)
    }

    const render = () =>{
        try {
            ReactDOM.render(
                <Container
                    refId={m.element.id}
                    blocks={m.data}
                    startBlockId={m.options.startBlockId || 1}
                    history={m.options.history || false}
                    defaultStatus={m.options.defaultStatus}
                    onLoad={m.options.onLoad || function () { }}
                    onError={m.options.onError || logException}
                    onClose={m.options.onClose || function () { }}
                    onTrack={m.options.onTrack || function () {}}
                    onCallback={m.options.onCallback || function () { }}
                    header = {m.options.header}
                    scrollMode = {m.options.scrollMode || 'end'}
                    direction = {m.options.direction}
                    base_url = {m.options.base_url}

                />,
                m.element
            )
        } catch(ex){
            logException(ex)
        }
    }

    const dispose = () => {
        ReactDOM.unmountComponentAtNode( m.element)
    }

    const changeStatus = status => {
        m.options.defaultStatus = status
        render()
    }

    render()

    return {
        changeStatus,
        dispose,
        __VERSION__
    }
}

const __VERSION__ = '[AIV]{version}[/AIV]'

export {ChatBot, __VERSION__}