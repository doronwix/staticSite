/* eslint no-console: 0 */

const path = require('path')
const fs = require('fs')
const { parse } = require('path')

// const file_name = 'lexi_2_en.js'
// const PREFIX = 'chatbot_lexi_msg'

// const file_name = 'max_6_en.js'
// const PREFIX = 'chatbot_max_msg'

// const file_name = 'lexi_2_sp.js'
// const PREFIX = 'chatbot_lexi_msg'

// const file_name = 'max_6_sp.js'
// const PREFIX = 'chatbot_max_msg'

// const file_name = 'lexi_2_ar.js'
// const PREFIX = 'chatbot_lexi_msg'

const file_name = 'max_6_ar.js'
const PREFIX = 'chatbot_max_msg'

// const file_name = 'maxsa_1_en.js'
// const PREFIX = 'chatbot_maxsa_msg'

const CHATBOT_CONFIG_FILE = path.resolve(__dirname, '../data/PersonalGuide/'+ file_name)
const txt_data = fs.readFileSync(CHATBOT_CONFIG_FILE, 'utf-8')

const data = JSON.parse(txt_data)

fs.writeFileSync(path.resolve(__dirname, 'template.' + file_name + 'original.json'), JSON.stringify(data, null, 2), 'utf-8')

const getMessageKey = (idx1, idx2, idx3=null)=>{
    return '@@' + PREFIX + '_' + idx1 + '_' + idx2 + (idx3!==null?'_'+idx3:'') + '@@'
}

let PARSED = []
const parsedAdd = (k, s, parentRef = null, prop = null) => {
    PARSED.push({k: k, s: s})
    if(null === parentRef || prop === null){
        console.error('missing aruments: ', k, s)
        throw 'missing arguments'
        return
    }
    parentRef[prop] = k
}

const KEYWORDS_STRINGS = [
    '...',
    'blockid',
    'type'
]
const escludeString=(s)=>{
    
    if(0 <= KEYWORDS_STRINGS.indexOf(s.toLowerCase())){
        return true
    }

    return false
}

const parseArray = (a, idx, idx2) => {
    a.forEach((v, idx3)=>{
        if(typeof v === 'string'){
            if(!escludeString(v)){
                parsedAdd(getMessageKey(idx, idx2), v, a, idx3)
            }
        }else{
            switch(typeof v){
                case 'object':
                    if(Array.isArray(v)){
                        parseArray(v, idx, idx2)
                    }else{
                        parseObject(v, idx, idx2)
                    }
                    break
                default:
                    // console.log('parseArray: typeof v', typeof v, v)
            }
        }

    })
}

const parseObject = (o, idx, idx2) => {
    Object.keys(o).forEach(k=>{
        if(typeof k === 'string' && !escludeString(k)){
            parsedAdd(getMessageKey(idx,idx2), k)
        }else{
            if(Array.isArray(k)){
                parseArray(k, idx, idx2)
            }else{
                parseObject(k, idx, idx2)
            }
        }
    })
}

const parseVideo = (video, idx1, idx2)=>{
    if(video.url){
        parsedAdd(getMessageKey(idx1, idx2, 'url'), video.url, video, 'url')
    }
    if(video.description){
        parsedAdd(getMessageKey(idx1, idx2, 'description'), video.description, video, 'description')
    }
    if(video.title){
        parsedAdd(getMessageKey(idx1, idx2, 'title'), video.title, video, 'title')
    }
    if(video.thumbnail){
        parsedAdd(getMessageKey(idx1, idx2, 'thumbnail'), video.thumbnail, video, 'thumbnail')
    }

}


const parseChoices = (choices, idx1, idx2) => {
    choices.forEach((c, idx3) => {
        let txt
        if(c.text){
            txt=c.text
            parsedAdd(getMessageKey(idx1, idx2, idx3 + '_text'), txt, c, 'text')
        }
        if(c.postback){
            parsedAdd(getMessageKey(idx1, idx2, idx3+ '_postback'), c.postback, c, 'postback')
        }
    })
}


const parseResponse = (response, idx1, idx2) => {
        if(response.wrong && response.wrong.text){
            let o = response.wrong
            let txt = o.text
                
            parsedAdd(getMessageKey(idx1, idx2, '_text_wrong'), txt, o, 'text')
        }

        if(response.correct && response.correct.text){
            let o = response.correct
            let txt = o.text
                
            parsedAdd(getMessageKey(idx1, idx2, '_text__correct'), txt, o, 'text')
        }
}

const parseLesson = (lesson, idx1, idx2) => {
    if(lesson.subtitle){
        parsedAdd(getMessageKey(idx1, idx2, 'subtitle'), lesson.subtitle, lesson, 'subtitle')
    }
    if(lesson.description){
        parsedAdd(getMessageKey(idx1, idx2, 'description'), lesson.description, lesson, 'description')
    }
    if(lesson.title){
        parsedAdd(getMessageKey(idx1, idx2, 'title'), lesson.title, lesson, 'title')
    }
    if(lesson.url){
        parsedAdd(getMessageKey(idx1, idx2, 'url'), lesson.url, lesson, 'url')
    }
    if(lesson.thumbnail){
        parsedAdd(getMessageKey(idx1, idx2, 'thumbnail'), lesson.thumbnail, lesson, 'thumbnail')
    }
}

const parseQuiz = (quiz, idx1, idx2) => {
    if(quiz.text){
        parsedAdd(getMessageKey(idx1, idx2, 'text'), quiz.text, quiz, 'text')
    }

    quiz.choices.forEach((c, idx3)=>{
        if(c.text){
            parsedAdd(getMessageKey(idx1, idx2, idx3), c.text, c, 'text')
        }    
    })

}

let tmp = []
data.forEach((v1)=>{
    let messages = v1.messages
    if( messages ){//&& v1.id === 33){//} && idx===38){
        let blockId = v1.id
        if(!blockId)
            throw 'found block withouth id'

        messages.forEach((m, idx2)=>{
            switch(typeof m){
                case 'string':
                    if(!escludeString(m))
                        parsedAdd(getMessageKey(blockId, idx2), m, messages, idx2)
                    break
                case 'object':
                    if(m && m.type){
                        let t = m.type.toLowerCase()
                        switch(t){
                            case 'image':
                                parsedAdd(getMessageKey(blockId, idx2), m.url, m, 'url')
                                break
                            case 'video':
                                parseVideo(m, blockId, idx2)
                                break
                            case 'choices':
                                parseChoices(m.choices, blockId, idx2)
                                break
                            case 'lesson':
                                parseLesson(m, blockId, idx2)
                                break
                            case 'quiz':
                                parseQuiz(m, blockId, idx2)
                                break
                            case 'freeTextInput':
                                throw ('found "freeTextInput"')
                                break
                            case 'feedback':
                            case 'goto':
                                // NOTHING TO DO
                                break
                            default:
                                if(Array.isArray(m)){
                                    parseArray(m, blockId, idx2)
                                }else{
                                    parseObject(m, blockId, idx2)
                                }
                                break
                        }
                        if( m.response){
                            parseResponse(m.response, blockId, idx2)
                        }
                    }else{
                        if(m){
                            if(Array.isArray(m)){
                                parseArray(m, blockId, idx2)
                            }else{
                                parseObject(m, blockId, idx2)
                            }
                        } else{
                            // console.error('m.type => ', m)
                        }
                    }
                    break
                default:
                        // console.log('typeof m', typeof m, m)
            }
        })
    }
})
console.log('\n################################################################\n')
// console.dir(PARSED.map(v=>v.k+': '+v.s), PARSED.length)
console.log('found: ', PARSED.length)
fs.writeFileSync(path.resolve(__dirname, 'keys.' + file_name + '.json'), JSON.stringify(PARSED, null, 2), 'utf-8')

console.log('\n################################################################\n')
// console.dir(data)'template.', file_name, 
fs.writeFileSync(path.resolve(__dirname,'template.' + file_name + '.json'), JSON.stringify(data, null, 2), 'utf-8')
