/**
 * 此为model基类,所有业务层model都要继承此类
 */
import axios from 'axios'
import replaceVars from '../utils/replace-vars'
import date from '../utils/date'
import store from '../store'
import {Message} from 'element-ui'

/**
 * 默认查询query参数配置
 */
const DEFAULT_PARAMS = {
  CLIENT: 'web', // 开发模式下，没有 cordova 对象，默认给值 'browser'
  TIMESTAMP: date(+new Date(), 'yyyy-MM-dd h:m:s')
};

let signBase = {
  client: DEFAULT_PARAMS.CLIENT,
  timestamp: DEFAULT_PARAMS.TIMESTAMP
};
const handleError = error => {
  const message = (error.data && error.data.message) || error.message || error.msg || 'Unknow Error';
  if (!store.getters.loadingState) {
    Message({type: 'error', message: message})
  }
  if (message === 'Network Error') {
    global.location.replace('#/login');
  }
  console.log('[ERROR]', message);
};

// 创建axios实例
const service = axios.create({
  baseURL:process.env.VUE_APP_BASE_URL,
  // baseURL:'/api',
  timeout: 60000,
  // withCredentials: true
});

const CANCEL_TOKEN = Axios.CancelToken
// 请求拦截器
service.interceptors.request.use(async (config) => {
  store.commit('changeLoading', true);
  const token = store.state.userInfo && store.state.userInfo.token || config.data.token || '';
  if (token) {
    // config.headers['token'] = `${token}`;
    config.headers['Authorization'] = `${token}`;
  }
  config.cancelToken = new CANCEL_TOKEN(c => {
    const httpRequestList = [...store.state.httpRequestList]
    httpRequestList.push(c)
    store.commit('setHttpRequestList', httpRequestList)
  })
  return config
}, err => {
  store.commit('changeLoading', false);
  return Promise.reject(err)
});

// 响应拦截器
service.interceptors.response.use(response => {
  store.commit('changeLoading', false);
  if (response.data.state === 401 && global.location.hash !== '#/login') {
    global.location.replace('#/login');
    return Promise.reject(handleError(response.data))
  } else {
    if (response.data.hasOwnProperty('state') && response.data.state !== 0){
      return Promise.reject(handleError(response.data))
    }
    return response.data
  }
}, err => {
  store.commit('changeLoading', false);
  if (err.response.data.state === 401  && global.location.hash !== '#/login'){
    global.location.replace('#/login');
  }
  if (err.message !== 'interrupt') {
    Message.closeAll()
    Message.error('服务器异常')
    setTimeout(() => {
      global.location.replace('#/login')
    }, 1000)
  }
  return Promise.reject(handleError(err.response.data || err))
});

/**
 * 数据模型，用来封装业务数据请求
 */
export default class Base {
  /**
   * 解析 params
   * @param {Object} _signParams
   * @returns {String}
   */
  static _makeURLParams(_signParams) {
    const _params = Object.keys(_signParams);
    let _urlParams = '?';
    for (let i = 0; i < _params.length; i++) {
      _urlParams += `${_params[i]}=${encodeURI(_signParams[_params[i]])}`;
      if (i < _params.length - 1) _urlParams += '&'
    }
    return _urlParams
  }

  /**
   * 拼接参数url
   */
  _handleURLConnectionParams(url, data) {
    var reg = new RegExp(/{[a-zA-Z]*}/, 'g');
    var parameters = url.match(reg);
    if (parameters != null && parameters.length > 0) {
      parameters.forEach(function (item, index) {
        var tmp = item.replace('{', '').replace('}', '');
        if (data === undefined) {
          url = url.replace('/' + item, '')
        } else {
          url = url.replace(item, data[tmp])
        }
      })
    }
    return url
  }

  /**
   * 组织接口参数
   * @param {Object} options
   * @returns {Object}
   */
  _handleHttpOptions(options) {
    let {url, vars = {}, params = {}} = options;
    if (!url) throw new Error('please set param  "url" ! ');
    if (~url.indexOf('${')) {
      url = replaceVars(url, vars)
    }
    signBase.timestamp = date(+new Date(), 'yyyy-MM-dd h:m:s');
    url += Base._makeURLParams({...params, ...signBase});
    url = this._handleURLConnectionParams(url, options.data);
    options.url = url;
    return options
  }

  async httpGet(options) {
    let {url, data, params = {}} = options;
    if (!url) throw new Error('please set param  "url" ! ');
    signBase.timestamp = date(+new Date(), 'yyyy-MM-dd h:m:s');
    url += Base._makeURLParams({...params, ...data, ...signBase});
    url = this._handleURLConnectionParams(url, options.data);
    return service({method: 'get', url})
  }

  async httpGetDownload(options) {
    let {url, data, params = {}} = options;
    if (!url) throw new Error('please set param  "url" ! ');
    signBase.timestamp = date(+new Date(), 'yyyy-MM-dd h:m:s');
    url += Base._makeURLParams({...params, ...data, ...signBase});
    url = this._handleURLConnectionParams(url, options.data);
    return service({method: 'get', responseType: 'arraybuffer', url})
  }

  async httpDownload(options) {
    let {url, data, params = {}} = options
    if (!url) throw new Error('please set param  "url" ! ');
    signBase.timestamp = date(+new Date(), 'yyyy-MM-dd h:m:s');
    url += Base._makeURLParams({...params, ...data, ...signBase});
    url = this._handleURLConnectionParams(url, options.data);
    return service({
      method: 'get', url, responseType: 'blob',
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpPost(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'post',
      url: options.url,
      data: options.data,
      timeout: options.timeout !== undefined ? options.timeout : 60000,
      cancelToken: new CancelToken(c => {
        cancel = c
      }),
    })
  }

  async httpPostDownload(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'post',
      url: options.url,
      responseType: 'arraybuffer',
      data: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpPut(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'put',
      url: options.url,
      data: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpDelete(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'delete',
      url: options.url,
      data: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpDeleteParam(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'delete',
      url: options.url,
      params: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpPostParam(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'post',
      url: options.url,
      params: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpPostParamData(options) {
    // options = this._handleHttpOptions(options);
    return service({
      method: 'post',
      url: options.url,
      params: options.params,
      data: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpPutParam(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'put',
      url: options.url,
      params: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }

  async httpDelParam(options) {
    options = this._handleHttpOptions(options);
    return service({
      method: 'delete',
      url: options.url,
      params: options.data,
      cancelToken: new CancelToken(c => {
        cancel = c
      })
    })
  }
}
