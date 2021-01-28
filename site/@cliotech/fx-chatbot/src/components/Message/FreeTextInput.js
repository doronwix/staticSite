import React, { useRef, useState, useEffect } from 'react'

import Text from './Text'

import styles from './index.module.scss'

const FreeTextInput = ({ data, blockId, onClick }) => {
  const textInput = useRef(null)
  const [submitEnabled, enableSubmit] = useState(data.is_optional)
  const [editEnabled, enableEdit] = useState(true)
  const [free_text, setText] = useState('')
  const maxLength = data.max_length || 256
  
  useEffect(()=>{
    if(!data.is_optional){
        enableSubmit(free_text.length > 0)
    }
  }, [data.is_optional, free_text.length])

  const click = () => {
    if(!data.is_optional && free_text.length <= 0 ){
      textInput.current.focus()
      return
    }

    data.text_value = free_text
    enableEdit(false)
    onClick(data, blockId)
  }

  const onChange=(evt)=>{
      setText(evt.target.value)
  }

  return (
    (!editEnabled)?
      <Text text={data.text_value} sender={'user'} data_automation_key={'textarea_ro_' + blockId}></Text>
      :
      <>
        <div className={styles.text, styles.freeTextAreaContainer}>
          <textarea data-automation={'textarea_' + blockId}  ref={textInput} className={styles.freeTextArea} placeholder={data.placeholder} onChange={onChange} maxLength={maxLength}></textarea>
        </div>
        <div className={styles.submit_button_container}>
          <button data-automation={(data.content_key || 'textarea_submit_button') + '_' + blockId} className={submitEnabled ? styles.submit_button : styles.submit_button_disabled }
            onClick={click}
            dangerouslySetInnerHTML={{ __html: data.text }} />
        </div>
      </>
  )
}

export default FreeTextInput
