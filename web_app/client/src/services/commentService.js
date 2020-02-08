import axios from 'axios';

export default {
    getComments: async (pid, sid) => {
        let res = await axios.get(`/api/comments/byId/${pid}-:${sid}`);
        return res.data || null;
    },
    addComment: async (comment_data) => {
        console.log("this is about to be posted");
        console.log(comment_data);
        let res = await axios.post(`/api/comments/add`, comment_data);
        console.log('post-res');
        console.log(res);
        return res.data || null;
    }
}