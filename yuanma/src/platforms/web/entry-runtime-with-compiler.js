/* @flow */

/**
 * ### <从入口开始分析vue源码> -- 对应思路
 * 这是Runtime + Compiler版本的入口。为了分析 Vue 的编译过程，所以重点分析的源码是 Runtime+Compiler 的 Vue.js。而不是Runtime Only；
 * 首先可以看到这里最后一行，把vue对象导出，也就是当我们new vue({})执行的时候，也就是执行导出的这个vue
 * 随后我们可以看到这里的vue从runtime/index中引入，我们一步步跟着翻到runtime/index。
 *
 * 另外值得一提的是$mount方法之所以放在最后挂载，是因为最开始提到的有区分两种不同的编译版本，分别对应不同的入口中的$mount方法。
 * 如下这个部分的$mount方法在Runtime Only版本中是不存在的；这里是多出的一个把template或者传入的el转为render函数的过程
 */

 /**
  * ### <vue实例的挂载（$mount方法的实现）> -- 对应思路
  * 首先可以看到这里是第二次定义$mount方法，因为就像上面第9行所说的，对应两种不同的vue版本；
  * 总体来说这里的$mount方法就是单纯的帮助Runtime+Compiler版本把传入的el或者template变成render方法
  * 最终还是通过Runtime Only版本中的$mount方法进行挂载；(src/platforms/runtime/index)
  *
  */



import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

const idToTemplate = cached(id => {
  const el = query(id)            //查找这个id的dom
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (                   //$mount方法函数
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {                        //如果没有render，则尝试获取template属性并将其编译成render
    let template = options.template
    if (template) {                             //先看template有没有，这意味着template优先级比传入的el高，会覆盖el
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {       //??????
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {            //如果是个dom，则取dom的innerHTML
        template = template.innerHTML
      } else {                                   //否则报错，所以一旦写了template就要写对，因为他优先级比mount函数传入的el优先级更高
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {                             //如果没有template，则取传入el的outerHtml作为模板解析并最终将其编译成render
      template = getOuterHTML(el)
    }
    if (template) {                              //进过解析，确定有el或者template存在（如上部分可以说就是把el或者template转成html字符串）
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(template, {      //这里是最终把template或者传入的el，把他们的html字符串变成render函数，具体关于该函数在后面解析
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render                          //就算没写render写了el或者template最终也是解析成render函数，vue只认render函数
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)           //最终同样把el传入。跟runtime onlye版本一样的执行，只是这里多了如上转换render函数的步骤
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue      // 入口这里导出vue对象供使用
