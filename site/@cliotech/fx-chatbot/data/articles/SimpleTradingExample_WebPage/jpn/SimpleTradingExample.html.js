import React from 'react'

import styles from '../css/notifications.scss'

import CFDTradingExample_img from '../images/CFDTradingExample_img.png'
import CFDTradingExample_img2 from '../images/CFDTradingExample_img2.png'
import CFDTradingExample_img3 from '../images/CFDTradingExample_img3.png'

const SimpleTradingExample = () => {
   return (
      <article className={styles.article}>
         <div className={styles.PopupWrapper}>
            <div className={styles.content}>
               <div className={styles.depHeader}>
                  <p className={styles.MainTitle}>
                     <span className={styles.MainTitleThinner}>Find a quick</span>
                     <br />
                     trading example
               </p>
                  <img className={styles.ImgHeader} src={CFDTradingExample_img} alt="" />
               </div>
               <div className={styles.dep}>
                  <p className={styles.text1}>
                     The iFOREX trading platforms allows you to easily trade currencies, commodities, indices, shares, ETFs and cryptocurrencies in the form of CFDs. How do you open a deal?
               </p>
                  <p className={styles.FirstTitle}>
                     Buy and Sell deals
               </p>
                  <p className={styles.text1}>
                     When you trade CFDs with iFOREX, you can take advantage of any change in any price change of a specific instrument, regardless if you think it'll rise or fall. Think the price of an instrument will fall? Open a ‘Sell’ deal. Think it will rise? Open a 'Buy' deal.
               </p>
                  <p className={styles.FirstTitle}>
                     An example of a deal
               </p>
                  <p className={styles.text2}>
                     This is how to open a deal with iFOREX in four quick steps:
               </p>
                  <ol className={styles.NumList}>
                     <li>
                        Choose a CFD instrument <span className={styles.ListText}>(a currency pair, commodity, share, crypto, etc.)
                     In this example, let's go with WTI Crude Oil, and assume a single CFD costs $60.</span>
                     </li>
                     <li>
                        Choose your deal size<br />
                        <span className={styles.ListText}>
                           The maximum leverage on oil is 200:1. So, with a $200 investment, you can open a deal of up to $40,000.
                           How come? Well:
                     <br />
                           <span className={styles.ListTextOrenge}>$200 X 200 = $40,000</span>
                           <br />
                           How many $60 contracts can we buy with $40,000?
                     <br />
                           Let's round it down to <span className={styles.ListTextOrenge}>650</span>.
                     </span>
                     </li>
                     <li>
                        Choose a direction
                     <br />
                        <span className={styles.ListText}>Remember the ‘Buy’ and ‘Sell’ deals? In this case, we’ll choose a ‘Buy’ position, meaning we think the price of oil is going to rise.</span>
                     </li>
                     <li>
                        Close your deal
                     <br />
                        <span className={styles.ListText}>Let’s say the price of oil rose by $2. You decide to close the deal. What’s your profit?</span>
                     </li>
                  </ol>
                  <img className={styles.img} src={CFDTradingExample_img2} alt="" />
                  <img className={styles.img1} src={CFDTradingExample_img3} alt="" />
                  <ol className={styles.NumList + ' ' + styles.NoneNumList}>
                     <li>
                        <p className={styles.BoxText}>
                           <span className={styles.ListText}>
                              If you’re answer is $2, that’s not quite right, because, as you recall, we bought 650 contracts. So, your real profit is actually:
                       </span>
                           <br />
                           $2 (profit) x 650 (contracts) = $1,300.
                     </p>
                     </li>
                     <li>
                        <p className={styles.ListTextSection}>
                           As you see, opening a deal on the iFOREX trading platform is pretty easy. Ready to continue? Let’s go.
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