import React from 'react'

import styles from '../css/notifications.scss'

import CFDTradingExample_img from '../images/CFDTradingExample_img.png'
import CFDTradingExample_img2_spa from '../images/CFDTradingExample_img2_spa.png'
import CFDTradingExample_img3_spa from '../images/CFDTradingExample_img3_spa.png'

const SimpleTradingExample = () =>{
   return (
      <article className={styles.article}>
         <div className={styles.PopupWrapper}>
            <div className={styles.content}>
               <div className={styles.depHeader}>
                  <p className={styles.MainTitle}>
                     <span className={styles.MainTitleThinner}>Encuentre un ejemplo</span>
                     <br />
                     de trading rápido
               </p>
                  <img className={styles.ImgHeader} src={CFDTradingExample_img} alt="" />
               </div>
               <div className={styles.dep}>
                  <p className={styles.text1}>
                     Las plataformas de trading de iFOREX le permiten negociar fácilmente monedas, materias primas, índices, acciones, ETF y criptodivisas en forma de CFD. ¿Cómo se abre una posición?
               </p>
                  <p className={styles.FirstTitle}>
                     Acuerdos de compra y venta
               </p>
                  <p className={styles.text1}>
                     Cuando negocia CFD con iFOREX, puede aprovechar cualquier cambio en cualquier variación de precio de un instrumento específico, independientemente de si cree que aumentará o disminuirá. ¿Cree que el precio de un producto caerá? Abra un acuerdo de 'Venta'. ¿Cree que va a subir? Abra una posición de 'Compra'.
               </p>
                  <p className={styles.FirstTitle}>
                     Un ejemplo de inversión
               </p>
                  <p className={styles.text2}>
                     Esta es la manera de abrir un acuerdo con iFOREX en cuatro rápidos pasos:
               </p>
                  <ol className={styles.NumList}>
                     <li>
                        Elija un instrumento CFD  <span className={styles.ListText}> (un par de divisas, materias primas, acciones, criptodivisas, etc.). En este ejemplo, vamos con el Petróleo Crudo WTI. Supongamos que un solo CFD cuesta 60 US$.</span>
                     </li>
                     <li>
                        Escoja el tamaño de su operación<br />
                        <span className={styles.ListText} >
                           El apalancamiento máximo en el petróleo es de 200:1. Entonces, con una inversión de 200 US$, puede abrir una transacción de hasta 40.000 US$. ¿Cómo es posible? Bien:
                     <br />
                           <span className={styles.ListTextOrenge}>200 US$ x 200 = 40.000 US$</span>
                           <br />
                           ¿Cuántos contratos de 60 US$ podemos comprar con 40.000 US$?
                     <br />
                           Redondeémoslo a <span className={styles.ListTextOrenge}>650</span>.
                     </span>
                     </li>
                     <li>
                        Elija una dirección
                     <br />
                        <span className={styles.ListText} >¿Recuerda las ofertas de 'Compra' y 'Venta'? En este caso, escogeremos una posición de 'Compra', lo que significa que creemos que el precio del petróleo va a subir.</span>
                     </li>
                     <li>
                        Cierre su posición
                     <br />
                        <span className={styles.ListText} >Supongamos que el precio del petróleo aumentó en 2 US$. Decide, pues, cerrar el acuerdo. ¿Cuál es su beneficio?</span>
                     </li>
                  </ol>
                  <img className={styles.img} src={CFDTradingExample_img2_spa} alt="" />
                  <img className={styles.img1} src={CFDTradingExample_img3_spa} alt="" />
                  <ol className={styles.NumList + ' ' + styles.NoneNumList}>
                     <li>
                        <p className={styles.BoxText}>
                           <span className={styles.ListText} >
                              Si su respuesta es 2 US$, eso no es del todo correcto, porque, como recordará, compramos 650 contratos. Entonces, su beneficio verdadero es en realidad:
                       </span>
                           <br />
                           2 US$ (ganancia) x 650 (contratos) = 1.300 US$.
                     </p>
                     </li>
                     <li>
                        <p className={styles.ListTextSection} >
                           Como puede ver, abrir un acuerdo en la plataforma de trading iFOREX es bastante fácil. ¿Listo para continuar? Vamos allá.
                     </p>
                     </li>
                  </ol>
               </div>
            </div>
         </div>
      </article>
   )
}

export default SimpleTradingExample