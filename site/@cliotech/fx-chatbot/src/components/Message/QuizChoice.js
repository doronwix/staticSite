import React from 'react'

import styles from './index.module.scss'


const QuizChoice = ({ data_automation_key, choice, selected, blockId, onClick }) => {
    return (
        <div
            data-automation={data_automation_key}
            className={`${styles.quizChoice} ${
                onClick == null ? styles.disabled : styles.enabled
                } ${selected ? (choice.correct ? styles.correct : styles.wrong) : ''}`}
            onClick={() => onClick && onClick(choice, blockId)}
        >
            {choice.text}
        </div>
    )
}

export default QuizChoice