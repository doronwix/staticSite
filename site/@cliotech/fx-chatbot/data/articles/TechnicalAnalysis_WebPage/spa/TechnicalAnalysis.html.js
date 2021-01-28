import React from 'react'

import styles from '../css/notifications.scss'

import TechnicalAnalysis_img from '../images/TechnicalAnalysis_img.png'
import TechnicalAnalysis_img1 from '../images/TechnicalAnalysis_img1.jpg'
import TechnicalAnalysis_img2_spa from '../images/TechnicalAnalysis_img2_spa.jpg'
import TechnicalAnalysis_img3 from '../images/TechnicalAnalysis_img3.jpg'
import TechnicalAnalysis_img4 from '../images/TechnicalAnalysis_img4.jpg'
import TechnicalAnalysis_img5_spa from '../images/TechnicalAnalysis_img5_spa.jpg'
import TechnicalAnalysis_icon1 from '../images/TechnicalAnalysis_icon1.jpg'
import TechnicalAnalysis_icon2 from '../images/TechnicalAnalysis_icon2.jpg'
import TechnicalAnalysis_icon3 from '../images/TechnicalAnalysis_icon3.jpg'
import TechnicalAnalysis_icon4 from '../images/TechnicalAnalysis_icon4.jpg'
import TechnicalAnalysis_icon5 from '../images/TechnicalAnalysis_icon5.jpg'

const TechnicalAnalysis = () => {
    return (
       <article className={styles.article}>
          <div className={styles.PopupWrapper}>
             <div className={styles.content}>
                <div className={styles.depHeader} >
                   <p className={styles.MainTitle} >
                      Comprensión
                      < br />
                      del análisis técnico
                   </p>
                   <img className={styles.ImgHeader} src={TechnicalAnalysis_img} alt="" />
                </div>
                <div className={styles.dep}>
                   <p className={styles.text1}>
                      El análisis técnico utiliza movimientos históricos de precios para tratar de predecir futuros movimientos de precios. Según esta teoría, los movimientos de precios se mueven en base a ciertos patrones que pueden rastrearse y reconocerse.
                   </p>
                   <p className={styles.FirstTitle}>
                      Comencemos con gráficos
                   </p>
                   <p className={styles.text1}>
                      Sí, lo sabemos, los gráficos pueden ser intimidantes, pero son la herramienta principal para los traders técnicos. ¿Por qué? Porque si toda la información del mercado se refleja en el precio, lo único que los traders deben tener en cuenta es el movimiento del precio. ¿Qué tipos de gráficos hay? Aquí hay algunos ejemplos populares...
                   </p>
                   <p className={styles.SecondaryTitle}>
                      <span className={styles.SecondaryTitle}>Gráfico lineal</span>
                   </p>
                   <p className={styles.text1}>
                      Una línea simple que sigue el movimiento del precio…eso es todo. La línea se dibuja desde un precio de cierre específico hasta el siguiente precio de cierre. Ofrece una buena descripción del movimiento de precios a través del tiempo.
                   </p>
                   <img className={styles.img} src={TechnicalAnalysis_img1} alt="" />
                   <p className={styles.SecondaryTitle}>
                      <span className={styles.SecondaryTitle}>Gráficos de barras</span>
                   </p>
                   <p className={styles.text1}>
                      Cada 'barra' representa un solo segmento de tiempo (unos minutos, una hora, un día, una semana, etc). Muestra los precios de apertura y cierre, así como los máximos y mínimos correspondientes. La parte inferior de la barra vertical indica el precio negociado más bajo en ese período de tiempo, mientras que la parte superior de la barra constata el precio más alto pagado. El precio de apertura está ubicado en el lado izquierdo de la barra y el precio de cierre está en el costado derecho.
                   </p>
                   <img className={styles.img1} src={TechnicalAnalysis_img2_spa} alt="" />
                   <img className={styles.img1} src={TechnicalAnalysis_img3} alt="" />
                   <p className={styles.SecondaryTitle}>
                      <span className={styles.SecondaryTitle}>Gráfico de velas</span>
                   </p>
                   <p className={styles.text1}>
                      Al igual que un gráfico de barras, una línea vertical representa el rango de precios, de mayor a menor. La diferencia es que la sección central de un gráfico de velas muestra la diferencia entre las tasas de apertura y cierre. Por lo general, si se llena la sección central "vela", el activo se cierra más bajo en relación a cómo abrió. Si está "vacío", se cierra más alto de lo que abrió. Sin embargo, en algunos casos, se puede usar un indicador diferente (por ejemplo, diferentes colores).
                   </p>
                   <img className={styles.img} src={TechnicalAnalysis_img4} alt="" />
                   <p className={styles.FirstTitle}>
                      Las tendencias del mercado
                   </p>
                   <p className={styles.text1}>
                      La tendencia es la dirección general del movimiento de precios de un instrumento o de un mercado específico. Dependiendo del período de tiempo, las tendencias pueden durar años o minutos, pero las clasificaciones más comúnmente aceptas son a corto, medio o largo plazo. Las tendencias se pueden describir de dos maneras: o bien un "mercado alcista" (donde los precios están aumentando o se espera que aumenten) o bien un "mercado bajista" (donde los precios están bajando o se espera que bajen).
                   <br />
                      <br />
                      Los mercados alcistas y bajistas se pueden utilizar como indicadores financieros. Por ejemplo, el comienzo de un mercado alcista es visto por algunos como un indicador de expansión económica. El comienzo de un mercado bajista, por su parte, es visto por algunos como un indicador de contracción económica. Recuerde: el sentimiento de los traders con respecto a las condiciones económicas futuras afecta a los precios.
                   </p>
                   <p className={styles.FirstTitle}>
                      Soporte y resistencia
                   </p>
                   <p className={styles.text1}>
                      Lo que todo trader quiere saber es cuándo, exactamente, está cambiando una tendencia. Según el análisis técnico, el soporte y la resistencia representan niveles de precios desde los cuales un instrumento específico rara vez se mueve por encima (resistencia) o por debajo (soporte).
                 <br />
                      ¿Confuso? Aquí encontrará un bonito diagrama que hicimos solo para usted.
                   </p>
                   <img className={styles.img} src={TechnicalAnalysis_img5_spa} alt="" />
                   <p className={styles.text1}>
                      El soporte y la resistencia son los niveles de precios a los que muchos inversores están dispuestos a vender el instrumento (si se trata de resistencia) o comprarlo (si se trata de soporte).
                     <br /><br />
                      En algunos casos, puede parecer que se ha roto un nivel de soporte o resistencia, pero más adelante descubrirá que el mercado solo le estaba "probando". Cuantas más "pruebas" no logren romper un nivel de resistencia o soporte, más fuerte es la resistencia o el soporte.
                     <br /><br />
                      Según el análisis técnico, al comprender estos niveles y seguirlos, puede decidir cuándo comprar y cuándo vender.
                   </p>
                   <p className={styles.FirstTitle}>
                      Indicadores técnicos
                   </p>
                   <p className={styles.text1}>
                      La plataforma de trading IFOREX presenta un 'Asistente de indicadores' que incluye muchos tiempos de indicadores populares utilizados por los operadores técnicos. Aquí hay algunos ejemplos populares:
    </p>
    <div className={styles.IconSection}>
       <img className={styles.icon} src={TechnicalAnalysis_icon1} alt="" />
       <p className={styles.IconTitle}>Puntos de pivote</p>
    </div>
    <p className={styles.text2}>
       Este indicador a corto plazo se utiliza para determinar la tendencia del mercado en plazos específicos y para identificar posibles "niveles de soporte y resistencia".
    </p>
    <div className={styles.IconSection}>
       <img className={styles.icon} src={TechnicalAnalysis_icon2} alt="" />
       <p className={styles.IconTitle}>Media móvil de convergencia / divergencia (MACD)</p>
    </div>
    <p className={styles.text2}>
       MACD intenta descubrir cambios en la dirección, la fuerza, la duración y el impulso de las tendencias en un instrumento específico.
    </p>
    <div className={styles.IconSection}>
       <img className={styles.icon} src={TechnicalAnalysis_icon3} alt="" />
       <p className={styles.IconTitle}>Elliott Wave</p>
    </div>
    <p className={styles.text2}>
       Este principio afirma que el mercado tiene ciclos repetitivos, reflejando teóricamente el sentimiento de los inversores. Estos ciclos (ondas) tienen patrones. Los comerciantes intentan identificar estos patrones con el objetivo de predecir qué hará el precio de un instrumento a continuación.
    </p>
    <div className={styles.IconSection}>
       <img className={styles.icon} src={TechnicalAnalysis_icon4} alt="" />
       <p className={styles.IconTitle}>Banda de Bollinger</p>
    </div>
    <p className={styles.text2}>
       Algunos inversores utilizan una Banda de Bollinger® para medir la "altura" o "baja" de un precio en relación a las operaciones anteriores. Estas bandas se usan como indicadores de volatilidad y se pueden usar para identificar patrones.
      <br />
       <br />
       Según la teoría, cuanto más se acerca el precio a la banda superior, más se sobrecompra instrumento. Cuanto más se acerque el precio a la banda inferior, más sobrevendido estará el instrumento. Cuando el mercado se vuelve cada vez más volátil, las bandas se amplían. Cuando el mercado se vuelve menos volátil, las bandas se vuelven más estrechas.
    </p>
    <div className={styles.IconSection}>
       <img className={styles.icon} src={TechnicalAnalysis_icon5} alt="" />
       <p className={styles.IconTitle}>Estrategia de Fibonacci</p>
    </div>
    <p className={styles.text2}>
       En una secuencia de Fibonacci, cada número que sigue a los dos primeros es la suma de los dos números anteriores. Por ejemplo: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...
      <br />
       <br />
       Algunos traders utilizan los niveles de retroceso de Fibonacci como áreas de soporte y resistencia, así como los niveles de "toma de ganancias". Debido a que muchas personas colocan órdenes de mercado en estos niveles, a veces pueden convertirse en profecías autocumplidas.
    </p>
 </div>
</div>
</div>
</article >
   )
}

export default TechnicalAnalysis