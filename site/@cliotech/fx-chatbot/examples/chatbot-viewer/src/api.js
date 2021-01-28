import axios from 'axios'

export const api = axios.create({
  baseURL:
    document.location.hostname === 'localhostxx'
      ? 'http://localhost:8080/api'
      : 'https://fxnet-help.herokuapp.com/api'
})
