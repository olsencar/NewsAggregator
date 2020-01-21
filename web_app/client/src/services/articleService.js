import axios from 'axios';

export default {
    getArticleById: async (id) => {
        let res = await axios.get(`/api/articles/byId/${id}`);
        console.log(res);
        return res.data || {};
    },
    getArticle: async (title, desc, source) => {
        let url = "/api/articles/find?";
        let filters = [];
        
        if (title) filters.push(`title=${encodeURIComponent(title)}`);
        if (desc) filters.push(`description=${encodeURIComponent(desc)}`);
        if (source) filters.push(`source_name=${encodeURIComponent(source)}`);
        
        url += filters.join('&');
        let res = await axios.get(url);
        console.log(res);
        return res.data || {};
    },
    getRecentArticles: async () => {
        let res = await axios.get('/api/articles/recent');
        console.log(res.status);
        return res.data || [];
    }
}