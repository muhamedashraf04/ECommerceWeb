import axios from 'axios';

export default axios.create({
    baseURL: '', // LEAVE THIS EMPTY. It will automatically default to the proxy.
    headers: {
        "Content-type": "application/json"
    }
});