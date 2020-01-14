import axios from 'axios';

export default {
    getArticle: async (id) => {
        let res = await axios.get(`/api/article/${id}`);
        return res.data || {};
    } 
}