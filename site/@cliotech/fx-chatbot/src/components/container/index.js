import React, { useState, useEffect, useReducer, useRef } from 'react'

import styles from './index.module.scss'
import Message from '../Message'
import Header from './header'
import { userReducer, messagesReducer } from '../../lib/reducers'

const Container = ({
    refId, blocks, startBlockId, defaultStatus = 'show', history = false, scrollMode = 'end',
    onError, onClose, onTrack, onCallback, onLoad, direction, base_url,
    header = {name: 'Max', slogan: 'at your service'}
}) => {
    const container = useRef(null)
    const [visibleOnTop, setVisibleOnTop] = useState(-1)
    let initialUserState = useInitialData(refId, history)
    const [userState, userDispatch] = useReducer(
        userReducer.bind(this, refId, history),
        history ? initialUserState : { blocks: [] }
    )
    const [messages, messageDispatch] = useReducer(messagesReducer, [])
    const [typing, setTyping] = useState(false)
    const [active, setActive] = useState(defaultStatus === 'show' ? true : false)

    const scrollContainer = (scrollTo) => {
        scrollTo = scrollTo || {}
        window.setTimeout(() => {
            if (container.current && container.current.children.length > 0) {
                let child = scrollTo.node || container.current.children[container.current.children.length - 1]
                child.scrollIntoView({
                    behavior: scrollTo.behavior || 'smooth',
                    inline: scrollTo.inline || 'nearest',
                    block: scrollTo.block || 'end'
                })
            }
        }, 100)
    }

    window.emilyScrollContainer = () => {
        scrollContainer()
    }

    useEffect(() => {
        if (onLoad != null) onLoad()
        if (defaultStatus === 'show') showBlock(startBlockId || 1)
    }, [])

    useEffect(() => {
        let status = defaultStatus === 'show' ? true : false
        if (active !== status) {
            setActive(status)
            if (status) showBlock(startBlockId || 1)
        }
    })

    const getVisibleOnTop = (nodes, visibleOnTop) => {
        for(let idx = visibleOnTop + 1; idx < nodes.length; idx++){
            let node = nodes[idx]
            if(node && 'true' === node.getAttribute('visibletop')){
                return {node, idx}
            }
        }

        return {}
    }
    useEffect(() => {
        if(scrollMode !== 'end'){
            let {node, idx} = getVisibleOnTop(container.current.children, visibleOnTop)

            if(idx >= visibleOnTop){
                setVisibleOnTop(idx)
                scrollContainer({
                    node: node,
                    block:'start'
                })
            }
        }else{
            scrollContainer()
        }
    }, [messages, typing, visibleOnTop])

    const getUserData = id => {
        if (Array.isArray(id)) {
            let blocks = []
            for (var i = 0; i < id.length; i++) {
                let b = userState.blocks.find(block => block.id === id[i])
                if (b != null) blocks.push(b)
            }
            return blocks.length > 0 ? blocks : undefined
        } else {
            return userState.blocks.find(block => block.id === id)
        }
    }

    const getNextPossibleBlocks = id => {
        let block = blocks.find(b => b.id === id)
        if (block) {
            let ids = []
            block.messages.forEach(m => {
                if (m.goto) ids.push(m.goto)
                if (m.blockId) ids.push(m.blockId)
                if (m.choices) {
                    if (m.response) {
                        ids.push(m.response.correct.goto)
                        ids.push(m.response.wrong.goto)
                    } else {
                        m.choices.forEach(choice => {
                            ids.push(choice.goto)
                        })
                    }
                }
            })
            return ids
        } else return null
    }

    const track = (eventName, eventData = [], block = {}, additionalData = {}) => {
        block.blockid = block.id

        let args = []

        if(eventData.map){
            args = eventData.map(arg =>
                arg.replace(/\[([^\]]*)\]/gi, function (a, b) {
                    return additionalData[b.toLowerCase()] || block[b.toLowerCase()] || 'NA'
                })
            )
        }

        if (onTrack != null) onTrack(eventName, eventData[0], args)
    }

    const getBlock = id => {
        if(typeof id === typeof 1){
            return blocks.find(block => block.id === id)
        } else {
            let {goto_if, goto_then, goto_else} = id

            let found = userState.blocks.find((el, idx)=>{
                return el.id === goto_if.id && 0 <= goto_if.answers.indexOf(el.answer)
            })
            let ret = blocks.find(block => block.id === (found ? goto_then : goto_else))
            return ret
        }
    }

    const showBlock = id => {
        try {
            let block = getBlock(id)
            if (block == null) {
                onError(`Could not find block #${id}`)
                return
            }

            let userData = getUserData(id)
            if (!userData) userDispatch({ type: 'viewed', payload: { blockId: id } })

            if (block && block.onLoad) track('load', block.onLoad, block)

            let delay = 0
            block.messages.forEach(message => {
                if (typeof message === 'string') {
                    if (message === '...') message = { type: 'typing', for: 2 }
                    else message = { type: 'text', text: message }
                } else if (message instanceof Array) {
                    if (message[0] === '...')
                        message = { type: 'typing', for: message[1] }
                    else message = { type: 'text', text: message[0], for: message[1] }
                }
                let _message = [{ ...message, blockId: id }]
                let nextBlock = null

                window.setTimeout(() => {
                    switch (message.type) {
                        case 'typing': {
                            setTyping(true)
                            return
                        }
                        case 'goto': {
                            _message = []
                            nextBlock = message.blockId
                            break
                        }
                        case 'feedback':
                        case 'quiz':
                        case 'choices': {
                            if (userData && userData.answer) {
                                let answer = message.choices.find(c => c.id === userData.answer)
                                if (answer) {
                                    switch (message.type) {
                                        case 'choices': {
                                            _message = [
                                                {
                                                    type: 'text',
                                                    text: answer.postback,
                                                    sender: 'user',
                                                    id: Math.random(),
                                                    blockId: id
                                                }
                                            ]
                                            nextBlock = answer.goto
                                            break
                                        }
                                        case 'quiz': {
                                            _message[0].answer = userData.answer
                                            let response = message.response[answer.correct ? 'correct' : 'wrong']
                                            _message.push({ ...response })
                                            nextBlock = response.goto
                                            break
                                        }
                                        case 'feedback': {
                                            _message[0].answer = userData.answer
                                            nextBlock = answer.goto
                                            break
                                        }
                                    }
                                }
                            }
                            break
                        }
                        case 'lesson':
                        case 'video': {
                            _message[0].viewed = userData ? true : false
                            _message[0].played = userData && userData.played ? true : false
                            _message[0].timeout = userData && userData.timeout ? true : false

                            if (_message[0].timeout) nextBlock = message.gotoGrace
                            else if (_message[0].played) nextBlock = message.goto
                            break
                        }
                        default: {
                            if (userData) {
                                nextBlock = message.goto || null
                                _message[0].viewed = true
                            }
                        }
                    }

                    _message.forEach(m =>
                        messageDispatch({ type: 'message', payload: m })
                    )

                    if (nextBlock != null) showBlock(nextBlock)

                    setTyping(false)
                }, delay)
                delay += userData ? 0 : (message.for || 0) * 1000
            })
        } catch (e) {
            onError(`Error showing block #${id}, ${e.message}`)
        }
    }

    const interact = interaction => {
        const { blockId, type, choice } = interaction

        let block = blocks.find(b => b.id === blockId)

        switch (type) {
            case 'submit':{
                messageDispatch({ type: 'submit-text', payload: { blockId } })
                userDispatch({ type: 'submit-text', payload: { blockId } })

                if (block && block.onClick) track('click', block.onClick, block, choice)

                if (choice.goto) showBlock(choice.goto)
                if (choice.onClick && onCallback) onCallback(choice.onClick)
                break
            }
            case 'choice': {
                messageDispatch({ type: 'choose-option', payload: { blockId, choice } })
                userDispatch({ type: 'choose-option', payload: { blockId, choice } })

                if (block && block.onClick) track('click', block.onClick, block, choice)

                if (choice.goto) showBlock(choice.goto)
                if (choice.onClick && onCallback) onCallback(choice.onClick)
                break
            }
            case 'feedback': {
                messageDispatch({
                    type: 'choose-feedback',
                    payload: { blockId, choice }
                })
                userDispatch({ type: 'choose-feedback', payload: { blockId, choice } })

                if (block && block.onClick) track('click', block.onClick, block, choice)

                if (choice.goto) showBlock(choice.goto)
                break
            }
            case 'quizChoice': {
                let response =
            block.messages[0].response[choice.correct ? 'correct' : 'wrong']

                messageDispatch({
                    type: 'answer-quiz',
                    payload: {
                        blockId,
                        choice,
                        response
                    }
                })
                userDispatch({ type: 'answer-quiz', payload: { blockId, choice } })

                if (block && block.onClick) track('click', block.onClick, block, choice)

                if (response.goto) showBlock(response.goto)
                break
            }
            case 'closeVideo':
            case 'timeoutVideo': {
                messageDispatch({ type: 'video-view', payload: { blockId, type } })
                userDispatch({ type: 'video-view', payload: { blockId, type } })

                if (block && block.onClose) track('close', block.onClose, block)

                let { goto, gotoGrace } = block.messages[block.messages.length - 1]
                if (type === 'timeoutVideo' && gotoGrace) {
                    showBlock(gotoGrace)
                } else {
                    if (getUserData(gotoGrace) && getUserData(getNextPossibleBlocks(gotoGrace))) {
                        return
                    }

                    if (!getUserData(goto)) {
                        if (type === 'closeVideo' && gotoGrace && getUserData(gotoGrace)) {
                            messageDispatch({ type: 'choose-option-if-exists', payload: { blockId: gotoGrace, choice: 0 } })
                            let b = getBlock(gotoGrace)
                            if (b != null) {
                                let choice
                                try {
                                    choice = b.messages[b.messages.length - 1].choices[0]
                                    userDispatch({
                                        type: 'choose-option',
                                        payload: { blockId: gotoGrace, choice }
                                    })
                                } catch (e) {
                                    onError(e)
                                }
                            }
                        }
                        showBlock(goto)
                    }
                }
                break
            }
            case 'video-view': {
                userDispatch({ type: 'video-view', payload: { blockId } })
                messageDispatch({ type: 'video-view', payload: { blockId } })

                if (block && block.onView) track('view', block.onView, block)
                break
            }
            default:
                track(type, {TEST:'UNKOWN'}, block)
                break
        }
    }

    return (<>
        <Header name={header.name} slogan={header.slogan} onClose={onClose} direction={direction} />
        <div className={styles.container + ' emily-container '} ref={div => { container.current = div }}>
            {
                messages.map((message) => (
                    <Message key={`message_${message.id}`}
                        data={{ ...message }}
                        onInteraction={interact}
                        onError={onError} 
                        direction={direction}
                        base_url={base_url} /> )
                )
            }

            { typing && <Message data={{ type: 'typing' }} direction={direction} /> }
        </div>
    </>)
}

function useInitialData(id, history) {
    let initialUserState =  { blocks: [], refId: id }
    let userDataFromStorage = null
    let storageKey = 'emilyUserData' + (id ? '_' + id : '')

    try {
        if(history){
            var stringData
            if(history ==='session'){
                stringData = sessionStorage.getItem(storageKey)
            } else {
                stringData = localStorage.getItem(storageKey)
            }

            if(stringData !== null){
                userDataFromStorage = JSON.parse(stringData)
            }
        }

    } catch (e) {
        onError(e)
    } finally {
        if (userDataFromStorage){
            initialUserState = userDataFromStorage
        }

    }

    return initialUserState
}

export default Container
