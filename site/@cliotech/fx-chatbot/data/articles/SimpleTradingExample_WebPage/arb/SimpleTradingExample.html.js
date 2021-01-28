import React from 'react'

import styles from '../css/notifications_rtl.scss'
import stylesRtl from '../css/notifications_rtl.scss'

import CFDTradingExample_img from '../images/CFDTradingExample_img.png'
import CFDTradingExample_img2_arb from '../images/CFDTradingExample_img2_arb.jpg'
import CFDTradingExample_img3_arb from '../images/CFDTradingExample_img3_arb.jpg'

const x = () => {
   return (
      <article className={stylesRtl.article}>
      <div className={stylesRtl.PopupWrapper}>
            <div className={stylesRtl.content}>
            <div className={stylesRtl.depHeader}>
            <h1 className={stylesRtl.h1}>
				مثال سريع
			   <br />
على التداول
               
               </h1>
               <img className={styles.ImgHeader} src={CFDTradingExample_img} alt="" />
            </div>
            <div  className={styles.dep}>
               <p>
			   تسمح لك منصة التداول الخاصة بـ  iFOREX بالتداول بسهولة على العملات , السلع , المؤشرات ,  الأسهم , صناديق الاستثمار المتداولة والعملات المشفرة على شكل عقود CFD. كيف تفتح صفقة جديدة؟
<br />
إليك بعض المعلومات المفيدة , وكذلك  مثال تداول بسيط  من اجل الإنطلاق.

               </p>
               <h2 className={stylesRtl.h2}>
           صفقات البيع والشراء
               </h2>
               <p>
            عندما تتداول العقود مقابل الفروقات ( CFD )  مع شركة  iFOREX ، يمكنك الاستفادة من أي تغيير في سعر أداة معينة ، بغض النظر عما إذا كنت تعتقد أنها سترتفع أو تنخفض. هل تعتقد أن سعر الأداة سينخفض؟ افتح صفقة "بيع". هل تعتقد أنها سترتفع؟ افتح صفقة "شراء".
               </p>
               <h2 className={stylesRtl.h2}> مثال على صفقة </h2>
               <p>
         أليك كيفية فتح صفقة مع iFOREX في أربع خطوات سريعة:
               </p>
               <ol className={stylesRtl.NumList}>
                  <li>
                     <b>إختر أداة CFD </b> (زوج عملات ، سلعة ، سهم ، عملات مشفره ، إلخ.)
					 <br />
                     في هذا المثال ، سوف نختار سلعة النفط  الخام ( WTI Crude Oil )  ، ونفترض أن تكلفة الـعقد الواحد تبلغ 60 دولارًا.
                  </li>
                  <li>
                    <b>اختر حجم صفقتك</b><br />
                     
                     الرافعة المالية القصوى على النفط هي 1:200. لذلك ، باستثمار 200 دولار ، يمكنك فتح صفقة تصل إلى 40,000 دولار.
					 <br />
					 كيف ذلك؟ حسنا:
                     <br />
                     <span className={stylesRtl.ListTextOrenge} style={{direction: 'ltr', display:'block'}}>$200 X 200 = $40,000</span>
                     <br />
                    كم عدد العقود والتي ثمنها 60 دولار  يمكننا شراؤها بمبلغ 40,000 دولار؟
                     <br />
                     دعونا نقوم بتقريب الإجابة الى <span className={stylesRtl.ListTextOrenge}>650</span> عقد.
                    
                  </li>
                  <li>
                <b>اختر الاتجاه</b>
                     <br />
                     هل تتذكر إمكانية فتح صفقات "الشراء" و "البيع" ؟ في هذه الحالة ، سنختار صفقة "شراء" ، مما يعني أننا نعتقد أن سعر النفط سيرتفع.
                  </li>
                  <li>
                <b> إغلاق الصفقة</b>
                     <br />
                     لنفترض أن سعر النفط ارتفع بمقدار دولارين. لقد قررت إغلاق الصفقة. ما هو ربحك؟
					 <img className={stylesRtl.img} src={CFDTradingExample_img2_arb.jpg} alt="" />	
               <img className={stylesRtl.img1} src={CFDTradingExample_img3_arb.jpg} alt="" />	
           <div className={stylesRtl.BoxText}>
                     <p>					 
                     إذا كانت إجابتك بان ربحك هو 2 دولارًا ، فهذا ليس صحيحًا تمامًا ، لأنه ، كما تتذكر ، لقد اشترينا 650 عقدًا. لذا ، فإن ربحك الحقيقي هو في الواقع:
						<br />
                     <b style={{display:'inline-block'}}> $2 ( ربح لكل عقد)   650X ( عقود ) = 1300$ </b>
                     </p>
					 </div>
               
                     
                  </li>
               </ol>
			   <p>
       كما ترى ، فتح صفقة على منصة تداول iFOREX أمر سهل للغاية. هل أنت جاهز للبدء؟  هيا بنا.
                     </p>
               
			
      
               </div> 
            </div>
         </div>
      </article>
   )
}

export default x