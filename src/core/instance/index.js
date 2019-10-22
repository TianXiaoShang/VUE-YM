/**
 * ### <从入口开始分析vue源码> -- 对应思路
 * 这里为vue的出生起点，可以看出它就是一个普通函数，通过new关键字调用为构造函数
 * 从他出生到最后导出，先通过init方法进行一系列初始化，随后又一直在给他的原型或者自身增加各种方法。
 * 变成一个功能丰富的类。
 * 我们接下来再从主干进入分支，开始研究vue一些核心方法的实现；
 */


 /**
  * ### <new Vue究竟发生了什么> -- 对应思路
  * 主要在initMixin方法中，可以看到对于data，props,methods,computed等方法做了很多初始化工作
  * 进入文件查看代码及注释即可
  */

import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {        //这里可以看到，Vue其实是一个function构造函数，用new关键词调用，并且在init初始化中过程中给vue增加一系列全局方法和原型方法等
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)     //使用在initMixin中给vue原型上定义的init方法，进行初始化
}

// 如下给vue增加很多原型方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
