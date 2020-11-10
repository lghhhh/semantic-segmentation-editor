import axios from './SseHttp.js'
import qs from 'qs';

const baseurl = "http://127.0.0.1:7001/api"
axios.defaults.baseURL = baseurl

export default {
    getImageDirectories(folder, pageIndex, pageLength) {
        return axios.get(`/file/directory`, {
            params: {
                folder: folder,
                pageIndex: pageIndex,
                pageLength: pageLength
            }
        })
    },
    getLayerConfig() {
        return axios.get(`/data/config`)
    }


}