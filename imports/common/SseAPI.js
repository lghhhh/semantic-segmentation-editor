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
    },
    //========= pcd文件层级结构
    getSseLayer(file) {
        return axios.get(`/data/layers/${file}`)
    },
    saveSseLayer(data, config = {}) {
        // 保存JSON格式的数据
        return axios.post(`/data/layers`, data, config)
    },
    //========= pdc文件语义 分割对象
    getSseObject(file) {
        return axios.get(`/data/sseobject/${file}`)
    },
    saveSseObject(data, config) {
        return axios.post(`/data/sseobject`, data, config)
    }



}