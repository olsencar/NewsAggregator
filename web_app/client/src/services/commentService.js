import axios from 'axios';

export default {
    getComments: async (pid, sid) => {
        let res = await axios.get(`/api/comments/byId/${pid}-:${sid}`);
        console.log(res);
        return res.data || {};
    },
    addComment: async (comment_data) => {
        let res = await axios.post(`/api/comments/add`, comment_data);
        console.log(res);
    }
}