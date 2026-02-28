import axios from "axios";
import Constants from '../utility/ConstData';
import StorageUtility from "../utility/StorageUtility";
import RefreshTokenCall from "./RefreshTokenCall";

// const axios = require('axios');
const instance = axios.create({
  baseURL: Constants.Base_Path,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(async request => {
  console.log('Api Method', '=========GET =========');
  console.log('Starting Request', request.url);

  var token = await StorageUtility.getJWTToken();
  console.log('JWT TOKEN', token);

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  // request.headers.Authorization = `Bearer dfhgkjdfhjkghdkfhgkdfghdfkghdfhgkjdfgdfkghkdfhgkjdfhgkgkdfkdfkjgdfklgdfgldfgdfkh`;

  console.log('Headers', request.headers);
  return request;
});

instance.interceptors.response.use(response => {
  console.log('Response Status:', response.status);
  return response;
});

// Track if we just refreshed to prevent infinite loops
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

export default {
  Get: (endpoint, pass, fail, params = null, isRetryAfterRefresh = false) => {
    console.log('Api EndPoint', endpoint);

    if (params != null) {
      endpoint = endpoint + params;
    }
    instance
      .get(endpoint)
      .then(function (response) {
        lastRefreshTime = 0; // Reset on success
        pass(response.data);
      })
      .catch(function (error) {
        console.log(endpoint, 'Error:->', error);

        if (error.response && error.response.status) {
          console.log(endpoint, 'Error Status:->', error.response.status);

          if (error.response.data) {
            let err = error.response.data;
            console.log(endpoint, 'err:->', err);

            if (
              error.response.status == 401 &&
              err.message &&
              err.message.includes('Unauthenticated') &&
              !isRetryAfterRefresh &&
              (Date.now() - lastRefreshTime) > REFRESH_COOLDOWN
            ) {
              console.log(endpoint, 'err.message:-> refreshing Token');
              lastRefreshTime = Date.now();
              RefreshTokenCall.refreshGetToken(endpoint, pass, fail, params);
            } else {
              fail(err);
            }
          } else {
            fail(error.response);
          }
        } else {
          // Network error or timeout
          console.log(endpoint, 'Network or other error without response');
          fail(error);
        }
      });
  },
};
