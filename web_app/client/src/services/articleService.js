import axios from 'axios';

export default {
    getArticle: async (id) => {
        let res = await axios.get(`/api/articles/byId/${id}`);
        console.log(res);
        return res.data || {};
    },
    getRecentArticles: async () => {
        let res = await axios.get('/api/articles/recent');
        console.log(res.status);
        return res.data || [];
    }
}