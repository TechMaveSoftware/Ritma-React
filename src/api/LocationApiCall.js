import axios from "axios";

const instance = axios.create({
  //baseURL: 'https://www.feroeg.com/',
  baseURL: 'https://maps.googleapis.com/maps/api/',
  timeout: 100000,
  headers: {'Content-Type': 'application/json'},
});

instance.interceptors.request.use(request => {
  console.log('Api Method', '=========GET =========');
  console.log('Starting Request', JSON.stringify(request));
  return request;
});

instance.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response));
  return response;
});

export default {
  Get: (endpoint, params = null, pass, fail) => {
    console.log('Api EndPoint', endpoint);

    if (params != null) {
      endpoint = endpoint + '?' + params;
    }
    instance
      .get(endpoint)
      .then(function (response) {
        pass(response.data);
      })
      .catch(function (error) {
        fail(error);
      });
  },
};
