import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import styles from './index.module.scss'

import VideoView from './videoView'
import LessonView from './lessonView'

class MediaPlayer extends Component {
  render() {
    const { type, onClose, url } = this.props
    return ReactDOM.createPortal(
      <>
        <div className={styles.overlay} />
        <div className={styles.mediaWindow + (type === 'lesson' ? ' ' + styles.lesson : '')}>
          <div className={styles.close} onClick={onClose} />
          {type === 'video' && (<VideoView url={url}></VideoView>)}
          {type === 'lesson' && (<LessonView url={url}></LessonView>)}
        </div>
      </>,
      document.body
    )
  }
}

export default MediaPlayer
