import axios from 'axios';

export default {
    getComments: async (pid, sid) => {
        let res = await axios.get(`/api/comments/byId/${pid}-${sid}`);
        return res.data || null;
    },
    addComment: async (comment_data) => {
        const resp = await axios.post(`/api/comments/add`, comment_data);
        return resp.data || null;
    }
}