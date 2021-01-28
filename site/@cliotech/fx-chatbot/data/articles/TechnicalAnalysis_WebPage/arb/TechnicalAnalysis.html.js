import React from 'react'

import styles from '../css/notifications.scss'
import stylesRtl from '../css/notifications_rtl.scss'

import TechnicalAnalysis_img from '../images/TechnicalAnalysis_img.png'
import TechnicalAnalysis_img1 from '../images/TechnicalAnalysis_img1.jpg'
import TechnicalAnalysis_img2_arb from '../images/TechnicalAnalysis_img2_arb.png'
import TechnicalAnalysis_img3 from '../images/TechnicalAnalysis_img3.jpg'
import TechnicalAnalysis_img4 from '../images/TechnicalAnalysis_img4.jpg'
import TechnicalAnalysis_img5_arb from '../images/TechnicalAnalysis_img5_arb.png'
import TechnicalAnalysis_icon1 from '../images/TechnicalAnalysis_icon1.jpg'
import TechnicalAnalysis_icon1_1 from '../images/TechnicalAnalysis_icon1_1.png'
import TechnicalAnalysis_icon2 from '../images/TechnicalAnalysis_icon2.jpg'
import TechnicalAnalysis_icon3 from '../images/TechnicalAnalysis_icon3.jpg'
import TechnicalAnalysis_icon4 from '../images/TechnicalAnalysis_icon4.jpg'
import TechnicalAnalysis_icon5 from '../images/TechnicalAnalysis_icon5.jpg'

const TechnicalAnalysis = () => {
   return (
      <article className={stylesRtl.article}>
      <div className={stylesRtl.PopupWrapper}>
             <div className={stylesRtl.content}>
               <div className={stylesRtl.depHeader}>
				      <div className={stylesRtl.depHeader_wrap}>
                     <p className={stylesRtl.MainTitle}>
                  فهم&nbsp;<br />التحليل الفني
                    </p>
                     <img className={stylesRtl.ImgHeader} src={TechnicalAnalysis_img} alt="" />
				      </div>
               </div>

               <div className={stylesRtl.dep}>
                  <p>
                  يستخدم التحليل الفني تحركات الأسعار التاريخية لمحاولة التنبؤ بحركات الأسعار المستقبلية. وفقًا لهذه النظرية ، تتحرك تحركات الأسعار في أنماط معينة يمكن تتبعها والتعرف عليها.
                  </p>
                  <p className={stylesRtl.FirstTitle}>
             لنبدأ بالرسوم البيانية
                  </p>
                  <p>
             نعم ، نعلم أن الرسوم البيانية يمكن أن تكون مخيفة ، لكنها الأداة الرئيسية للمتداولين الفنيين. لماذا ا؟ لأنه إذا انعكست جميع معلومات السوق على السعر ، فإن الشيء الوحيد الذي يحتاج المتداولون إلى التفكير فيه هو حركة السعر. ما نوع الرسوم البيانية الموجودة؟ إليك بعض الأمثلة الشائعة ...
                  </p>				
                  <p className={stylesRtl.SecondaryTitle}>
                     <span className={stylesRtl.BgSecondaryTitle}>الرسم البياني الخطي</span>
                  </p>
                  <p>
                هو خط بسيط يتبع حركة السعر ... هذا كل شيء. يتم رسم الخط من سعر إغلاق محدد إلى سعر الإغلاق التالي. يقدم نظرة عامة لطيفة على حركة السعر عبر الزمن.
                  </p>
                  <img className={stylesRtl.img} src={TechnicalAnalysis_img1} alt="" />	
                  <p className={stylesRtl.SecondaryTitle}>
                   <span className={stylesRtl.BgSecondaryTitle}>الرسوم البيانية الشريطية</span>
                  </p>
                  <p>
                يمثل كل "شريط" جزءًا واحدًا من الوقت (بضع دقائق ، أو ساعة ، أو يوم ، أو أسبوع ، وما إلى ذلك). ويبين أسعار الافتتاح والختام وكذلك الارتفاعات والانخفاضات ذات الصلة. يشير الجزء السفلي من الشريط الرأسي إلى أدنى سعر تداول لتلك الفترة الزمنية ، بينما يشير الجزء العلوي من الشريط إلى أعلى سعر مدفوع. يقع سعر الافتتاح على الجانب الأيسر من الشريط وسعر الإغلاق على الجانب الأيمن.
                  </p>
                  <img className={stylesRtl.img1} src={TechnicalAnalysis_img2_arb} alt="" />
				  <img className={stylesRtl.img1} src={TechnicalAnalysis_img3} alt="" />				  
				  <p className={stylesRtl.SecondaryTitle}>
                  <span className={stylesRtl.BgSecondaryTitle}>الشمعدان</span>
                  </p>
                  <p>
         تمامًا مثل الرسم البياني الشريطي ، يمثل الخط العمودي نطاق السعر - من الأعلى إلى الأدنى. الفرق هو أن القسم الأوسط من الرسم البياني بالشموع يظهر الفرق بين أسعار الافتتاح والإغلاق. عادة ، إذا تم ملء قسم "الشمعة" المركزي ، يتم إغلاق الأصل أقل من الافتتاح. إذا كانت "فارغة" أغلقت أعلى مما فتحت. ومع ذلك ، في بعض الحالات ، يمكن استخدام مؤشر مختلف (مثل ألوان مختلفة).
                  </p>
                  <img className={stylesRtl.img} src={TechnicalAnalysis_img4} alt="" />			
				  <p className={stylesRtl.FirstTitle}>
اتجاهات السوق
                  </p>
                  <p>
الاتجاه هو الاتجاه العام لحركة سعر الأداة أو سوق معينة. اعتمادًا على الإطار الزمني ، يمكن أن تستمر الاتجاهات سنوات أو دقائق ، ولكن التصنيفات الشائعة المقبولة هي قصيرة المدى أو متوسطة المدى أو طويلة المدى. يمكن وصف المؤشرات بإحدى طريقتين: إما "سوق صاعدة" (حيث ترتفع الأسعار أو من المتوقع أن ترتفع) أو "سوق هابطة" (حيث تنخفض الأسعار أو من المتوقع أن تنخفض).

				  <br />
				  <br />
يمكن استخدام الأسواق الصاعدة والهابطة كمؤشرات مالية. على سبيل المثال ، ينظر البعض إلى بداية السوق الصاعدة على أنها مؤشر على التوسع الاقتصادي. ينظر البعض إلى بداية السوق الهابطة كمؤشر للانكماش الاقتصادي. تذكر: إن مشاعرالمتداولين  بشأن الظروف الاقتصادية المستقبلية تؤثر على الأسعار.
                  </p>
				  <p className={stylesRtl.FirstTitle}>
الدعم والمقاومة
                  </p>
                  <p>
				ما يريد كل متداول معرفته هو متى يتغير الاتجاه بالضبط. وفقًا للتحليل الفني ، يمثل الدعم والمقاومة مستويات السعر التي نادرًا ما تتحرك لأداة معينة فوق (المقاومة) أو أقل (الدعم).
				<br />
				مشوش؟ إليك رسمًا تخطيطيًا لطيفًا قمنا بصنعه خصيصًا لك.
                  </p>				  
                  <img className={stylesRtl.img} src={TechnicalAnalysis_img5_arb} alt="" />	
                  <p>
				الدعم والمقاومة هما مستويات الأسعار التي يرغب العديد من المستثمرين في بيع الأداة المالية بها (إذا كنا نتعامل مع المقاومة) أو شرائها (إذا كنا نتعامل مع الدعم).
					<br /><br />
				في بعض الحالات ، قد يبدو الأمر كما لو تم كسر مستوى الدعم أو المقاومة ، ولكن في وقت لاحق ستكتشف أن السوق كان "يختبر" ذلك فقط. كلما زادت "الاختبارات" التي فشلت في كسر مستوى المقاومة أو الدعم ، زادت المقاومة أو الدعم.
					<br /><br />
				وفقًا للتحليلات الفنية ، من خلال فهم هذه المستويات واتباعها ، يمكنك تحديد موعد الشراء أو البيع.
                  </p>				  		
				  <p className={stylesRtl.FirstTitle}>
      المؤشرات التقنية
                  </p>
                  <p className={stylesRtl.text2}>
			تتميز منصة تداول iFOREX بـ "معالج المؤشرات" الذي يتضمن العديد من أنواع المؤشرات الشائعة التي يستخدمها المتداولون التقنيون. إليك بعض الأمثلة الشائعة:
                  </p>				  	
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon1_1} alt="" />					  
					 <p className={stylesRtl.IconTitle}>مؤشر القوة النسبية (RSI)</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
				يحاول هذا المؤشر المثير للاهتمام تقييم ما إذا كانت أداة - أو سوق - في حالة ذروة شراء أو ذروة بيع. كيف؟ من خلال مقارنة الخسائر والمكاسب الأخيرة خلال فترة زمنية محددة.
                  </p>
				 
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon1} alt="" />					  
					 <p className={stylesRtl.IconTitle}>النقاط المحورية</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
				يُستخدم هذا المؤشر قصير المدى لتحديد اتجاه السوق خلال أطر زمنية محددة وتحديد "مستويات الدعم والمقاومة" المحتملة.
                  </p>
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon2} alt="" />					  
					 <p className={stylesRtl.IconTitle}>تقارب المتوسط المتحرك/ اختلاف (MACD)</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
					يحاول MACD اكتشاف التغيرات في  الاتجاهات وقوتها ومدتها وزخمها في أداة معينة.
                  </p>
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon3} alt="" />					  
					 <p className={stylesRtl.IconTitle}>موجة إليوت</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
				يدعي هذا المبدأ أن السوق لديه دورات متكررة ، مما يعكس نظريًا شعور المستثمرين. هذه الدورات (الأمواج) لها أنماط. يحاول المتداولون تحديد هذه الأنماط ، بهدف التنبؤ بما سيفعله سعر الأداة بعد ذلك.
                  </p>
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon4} alt="" />					  
					 <p className={stylesRtl.IconTitle}>أشرطة بولينغر</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
				يستخدم بعض المستثمرين Bollinger Band® لقياس "ارتفاع" أو "انخفاض" السعر بالنسبة للتداولات السابقة. تُستخدم هذه النطاقات كمؤشرات للتقلبات ويمكن استخدامها لتحديد الأنماط.
					<br />
					<br />
				وفقًا للنظرية ، كلما اقترب السعر من النطاق العلوي ، كلما كانت الأداة في  ذروة  الشراء. وكلما اقترب السعر من النطاق السفلي ، كلما زاد بيع الأداة. عندما يصبح السوق أكثر تقلبًا بشكل متزايد ، تتسع النطاقات. عندما يصبح السوق أقل تقلبًا ، تصبح النطاقات أضيق.

                  </p>
				 <div className={stylesRtl.IconSection}>
					 <img className={stylesRtl.icon} src={TechnicalAnalysis_icon5} alt="" />					  
					 <p className={stylesRtl.IconTitle}>استراتيجية فيبوناتشي</p> 		
				 </div>
                  <p className={stylesRtl.text2}>
			في سلسلة فيبوناتشي ، كل رقم يلي أول رقمين هو مجموع الرقمين السابقين. على سبيل المثال: 0 ، 1 ، 1 ، 2 ، 3 ، 5 ، 8 ، 13 ، 21 ، 34 ، 55 ، 89 ، 144 ، ...
					<br />
					<br />
			يستخدم بعض المتداولين مستويات تصحيح فيبوناتشي كمناطق دعم ومقاومة بالإضافة إلى مستويات "جني الأرباح". لأن العديد من الناس يضعون أوامر السوق على هذه المستويات ، يمكن أن يصبحوا في بعض الأحيان نبوءات تحقق الذات.
                  </p>				  
               </div>
               
               </div>
               </div>

            </article>
   )
}

export default TechnicalAnalysis