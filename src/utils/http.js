import axios from 'axios'
import qs from 'qs'
// axios.defaults.withCredentials = true
axios.interceptors.response.use(function(response){
  // console.log(response)
  return response
})
// 请求方式的配置
export default {
  post(url, data) { //  post
    return axios({
      method: 'post',
      url,
      data,
      // timeout: 5000,
      baseURL:'http://localhost:3000',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      transformRequest:[function(data){
      	return qs.stringify(data, { arrayFormat: 'repeat' })
      }]
    })
  },
  get(url, params) { // get
    return axios({
      baseURL:'http://localhost:3000',
      method: 'get',
      url,
      params, // get 请求时带的参数
      timeout: 50000,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
  }
}
