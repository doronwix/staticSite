import React, { Suspense, Component } from 'react'
class HtmlView extends Component {
    render() {
        let OtherComponent

        switch (this.props.src) {
            // CFDTradingExample
            //case '//www.iforex.com/EMERP/Landing/masterLP/img/banners/CFDTradingExample_br1_mas.jpg':
            case '//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/eng/index_SimpleTradingExample.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/SimpleTradingExample_WebPage/eng/SimpleTradingExample.html.js' /* webpackChunkName: 'data/articles/en/SimpleTradingExample' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFDTradingExample_br1_spa.png':
            case '//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/spa/index_SimpleTradingExample_spa.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/SimpleTradingExample_WebPage/spa/SimpleTradingExample.html.js' /* webpackChunkName: 'data/articles/sp/SimpleTradingExample' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFDTradingExample_br1_arb.png':
            case '//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/arb/index_SimpleTradingExample_arb.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/SimpleTradingExample_WebPage/arb/SimpleTradingExample.html.js' /* webpackChunkName: 'data/articles/ar/SimpleTradingExample' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFDTradingExample_br1_jpn.png':
            case '//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/jpn/index_SimpleTradingExample_jpn.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/SimpleTradingExample_WebPage/jpn/SimpleTradingExample.html.js' /* webpackChunkName: 'data/articles/ja/SimpleTradingExample' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/CFDTradingExample_br1_kor.png':
            case '//imservice.fihtrader.com/Content/SimpleTradingExample_WebPage/kor/index_SimpleTradingExample_kor.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/SimpleTradingExample_WebPage/kor/SimpleTradingExample.html.js' /* webpackChunkName: 'data/articles/ko/SimpleTradingExample' */))
                break
            //TechnicalAnalysis
            //case '//www.iforex.com/EMERP/Landing/masterLP/img/banners/TechnicalAnalysis_br1_mas.png':
            case '//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/eng/index_TechnicalAnalysis.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/TechnicalAnalysis_WebPage/eng/TechnicalAnalysis.html.js' /* webpackChunkName: 'data/articles/en/TechnicalAnalysis' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TechnicalAnalysis_br1_spa.jpg':
            case '//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/spa/index_TechnicalAnalysis_spa.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/TechnicalAnalysis_WebPage/spa/TechnicalAnalysis.html.js' /* webpackChunkName: 'data/articles/sp/TechnicalAnalysis' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TechnicalAnalysis_br1_arb.jpg':
            case '//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/arb/index_TechnicalAnalysis_arb.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/TechnicalAnalysis_WebPage/arb/TechnicalAnalysis.html.js' /* webpackChunkName: 'data/articles/ar/TechnicalAnalysis' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TechnicalAnalysis_br1_jpn.jpg':
            case '//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/jpn/index_TechnicalAnalysis_jpn.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/TechnicalAnalysis_WebPage/jpn/TechnicalAnalysis.html.js' /* webpackChunkName: 'data/articles/ja/TechnicalAnalysis' */))
                break
            //case 'https://www.iforex.com/EMERP/Landing/masterLP/img/banners/TechnicalAnalysis_br1_kor.jpg':
            case '//imservice.fihtrader.com/Content/TechnicalAnalysis_WebPage/kor/index_TechnicalAnalysis_kor.html':
                OtherComponent = React.lazy(() => import('../../../../data/articles/TechnicalAnalysis_WebPage/kor/TechnicalAnalysis.html.js' /* webpackChunkName: 'data/articles/ko/TechnicalAnalysis' */))
                break
            default:
                OtherComponent = React.lazy(() => import('./GenericArticle' /* webpackChunkName: 'data/articles/GenericArticle' */))
        }

        return <Suspense fallback={<div>Loading...</div>}>
            <OtherComponent src={this.props.src} />
        </Suspense>
    }
}

export default HtmlView
