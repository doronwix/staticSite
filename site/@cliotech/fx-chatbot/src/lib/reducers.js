export let initialUserState = { blocks: [] }

export const userReducer = (refId, history, state, action) => {
    let newState
    switch (action.type) {
        case 'viewed': {
            newState = { blocks: [...state.blocks, { id: action.payload.blockId }] }
            break
        }
        case 'choose-feedback':
        case 'choose-option':
        case 'answer-quiz': {
            let block = state.blocks[state.blocks.length - 1]
            if (block.id === action.payload.blockId) {
                block.answer = action.payload.choice.id
                newState = { blocks: [...state.blocks] }
            } else
                throw new Error(
                    `Last block (${block.id}) is not ${action.payload.block.id}`
                )
            break
        }
        case 'video-view': {
            newState = {
                blocks: state.blocks.map(b => {
                    if (b.id === action.payload.blockId) {
                        if (action.payload.type === 'timeoutVideo')
                            return { ...b, timeout: true }
                        else return { ...b, played: true }
                    } else return { ...b }
                })
            }
            break
        }
        default: {
            newState = state
        }
    }
    if(history){
        if(history ==='session'){
            sessionStorage.setItem('emilyUserData' + (refId?'_'+refId:''), JSON.stringify(newState))
        } else {
            localStorage.setItem('emilyUserData' + (refId?'_'+refId:''), JSON.stringify(newState))
        }
    }

    return newState
}
export const messagesReducer = (state, action) => {
    let newState

    switch (action.type) {
        case 'message': {
            newState = state
                .map(message => {
                    return { ...message }
                })
                .concat([{ ...action.payload, id: Math.random() }])
            break
        }
        case 'choose-option-if-exists': {
            newState = state.map((message, index) => {
                if (index === state.length - 1 &&
                    message.blockId === action.payload.blockId) {
                    return {
                        type: 'text',
                        text: message.choices[action.payload.choice].text,
                        sender: 'user',
                        id: Math.random()
                    }
                } else return { ...message }
            })
            break
        }
        case 'choose-option': {
            newState = state.map((message, index) => {
                if (index === state.length - 1) {
                    return {
                        type: 'text',
                        text: action.payload.choice.postback,
                        sender: 'user',
                        id: Math.random()
                    }
                } else return { ...message }
            })
            break
        }
        case 'choose-feedback': {
            newState = state.map((message, index) => {
                if (index === state.length - 1) {
                    return { ...message, answer: action.payload.choice.id }
                } else return { ...message }
            })
            // newState.push({ ...action.payload.response })
            break
        }
        case 'answer-quiz': {
            newState = state.map((message, index) => {
                if (index === state.length - 1) {
                    return { ...message, answer: action.payload.choice.id }
                } else return { ...message }
            })
            let response = { ...action.payload.response }
            if (response.id == null)
                response.id = `${action.payload.blockId}_${
                    action.payload.choice.correct ? '_correct' : '_wrong'
                }`
            newState.push(response)
            break
        }
        case 'video-view': {
            newState = state.map((message, index) => {
                if (index === state.length - 1) {
                    return { ...message, played: true }
                } else return { ...message }
            })
            break
        }
        default:
            newState = state
    }
    return newState
}
