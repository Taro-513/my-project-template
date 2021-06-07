import Base from './base'

class Login extends Base {

  //登录
  login (opts) {
    return this.httpPost({
      url: '/sys/auth/login',
      data: opts,
      addLoading : true
    })
  }

  //登出
  logout (opts) {
    return this.httpPost({
      url: '/sys/auth/logout',
      data: opts
    })
  }

}

export default new Login()
