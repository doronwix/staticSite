import React, { useState } from 'react'
import styles from './index.module.scss'
import MediaPlayer from '../mediaPlayer'
import FreeTextInput from './FreeTextInput'
import Text from './Text'
import Lesson from './Lesson'
import QuizChoice from './QuizChoice'
import FeedbackChoice from './FeedbackChoice'
import Choice from './Choice'

const Message = ({ data, onInteraction, onError , direction, base_url}) => {
    const [video, setVideo] = useState(null)
    const [lesson, setLesson] = useState(null)

    let messages = []

    const closeVideo = action => {
        setVideo(null)
        onInteraction({ type: action, blockId: data.blockId })
    }
    const closeLesson = action => {
        setLesson(null)
        onInteraction({ type: action, blockId: data.blockId })
    }
    const playVideo = url => {
        setVideo(url)
        onInteraction({ type: 'video-view', blockId: data.blockId })
    }
    const playLesson = url => {
        setLesson(url)
        onInteraction({ type: 'video-view', blockId: data.blockId })
    }
    const feedbackClicked = (choice, blockId) => {
        onInteraction({ type: 'feedback', choice, blockId })
    }
    const buttonClicked = (choice, blockId) => {
        onInteraction({ type: 'choice', choice, blockId })
    }
    const quizChoiceClicked = (choice, blockId) => {
        onInteraction({ type: 'quizChoice', choice, blockId })
    }
    const freeTextInputButtonClicked = (choice, blockId) => {
        onInteraction({ type: 'submit', choice, blockId })
    }
    
    switch (data.type) {
    case 'image': {
        let url = 0 === data.url.indexOf('http') ? data.url : base_url + '/' + data.url
        messages.push(<img alt="" width="100%" src={url} />)
        break
    }
    case 'text': {
        if (data.text !== null && data.text !== '')
            messages.push(<Text {...data} data_automation_key={'message_'+ data.blockId}/>)
        break
    }
    case 'lesson': {
        messages.push(
            <Lesson
                onClose={closeLesson}
                onPlay={playLesson}
                {...data}
            />
        )
        break
    }
    case 'video': {
        messages.push(
            <Lesson
                onClose={closeVideo}
                onPlay={playVideo}
                type="video"
                {...data}
            />
        )
        break
    }
    case 'typing': {
        messages.push(
            <div className={`${styles.text} ${styles.bot} ${styles.typing}`}>
                <span />
                <span />
                <span />
            </div>
        )
        break
    }
    case 'quiz': {
        let isCorrectAnswer =
        data.answer != null
            ? data.choices.find(c => c.id === data.answer).correct
            : null
        messages.push(
            <div
                className={`${styles.quiz} ${
                    isCorrectAnswer === null
                        ? null
                        : isCorrectAnswer
                            ? styles.correct
                            : styles.wrong
                }`}
            >
                <div className={styles.title}>{data.text}</div>
                {data.choices.map((choice, index) => {
                    return (
                        <QuizChoice
                            key={`quiz_choice_${data.blockId}_${choice.id}`}
                            data_automation_key={`quiz_choice_${choice.id}_${data.blockId}`}
                            choice={choice}
                            blockId={data.blockId}
                            onClick={data.answer == null ? quizChoiceClicked : null}
                            selected={data.answer === choice.id}
                        />
                    )
                })}
            </div>
        )
        break
    }
    case 'feedback': {
        messages.push(
            <div
                className={`${styles.feedback} ${
                    data.answer != null ? styles.answered : ''
                }`}
            >
                {data.choices.map((choice, index) => {
                    return (
                        <FeedbackChoice
                            key={`choice_${index}`}
                            data_automation_key={(data.content_key || 'feedback_choice_' + index) + '_' + data.blockId}
                            data={choice}
                            blockId={data.blockId}
                            onClick={feedbackClicked}
                            selected={data.answer === choice.id}
                        />
                    )
                })}
            </div>
        )
        break
    }
    case 'choices': {
        if (data.choices == null || data.choices.length === 0) {
            throw new Error(`Choice message without choices! (${data.blockId})`)
        }
        messages.push(
            <div className={styles.choices}>
                {(data.choices || []).map((choice, index) => {
                    return (
                        <Choice
                            key={`choice_${index}`}
                            data_automation_key={(data.content_key || `choice_${index}`)  + '_' + data.blockId}
                            data={choice}
                            blockId={data.blockId}
                            onClick={buttonClicked}
                        />
                    )
                })}
            </div>
        )
        break
    }
    case 'freeTextInput':
        messages.push(<FreeTextInput
            onClick={freeTextInputButtonClicked}
            blockId={data.blockId}
            data={data.freeTextInput}
        ></FreeTextInput>)
        break
    default:
    }
    return (
    <>
      {lesson != null && (
          <MediaPlayer
              type="lesson"
              url={lesson}
              onClose={() => {
                  closeLesson('closeVideo')
              }}
          />
      )}
      {video != null && (
          <MediaPlayer
              type="video"
              url={video}
              onClose={() => {
                  closeVideo('closeVideo')
              }}
          />
      )}
      {messages.map((message, index) => (
          <div
              key={`message_${data.blockId}_${index}_${data.id}}`}
              className={`${styles.message} ${direction === 'rtl'? styles.rtl:''}`}
              visibletop={message.props.type === 'text' ? 'true' : 'false'}
          >
              {message}
          </div>
      ))}
    </>
    )
}

export default Message
