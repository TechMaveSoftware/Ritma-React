import axios from "axios";

const instance = axios.create({
  baseURL: 'https://jm.wipayfinancial.com/plugins/payments/', //https://tt.wipayfinancial.com/plugins/payments/request
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

instance.interceptors.request.use(request => {
  console.log('Api Method', '=========Payment Post=========');
  console.log('Starting Request', JSON.stringify(request));
  return request;
});

instance.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response));
  return response;
});

export default {
  getPaymentUrl: (data, pass, fail) => {
    let endpoint = 'request';

    console.log('Api EndPoint', endpoint);
    console.log('Api Post Data', data);

    instance
      .post(endpoint, data)
      .then(function (response) {
        pass(response.data);
      })
      .catch(function (error) {
        fail(error);
      });
  },

  // getFetchToken: (pass, fail) => {
  //   fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
  //     method: 'POST',
  //     headers: {
  //       // Accept: 'application/json',
  //       // 'Accept-Language': 'en_US',
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       Authorization:
  //         'Basic ' +
  //         'QVFGb2dTSmpGNHRSY1l3eGtQWGV5emo3QkVwOEo1U0szRFl3MjBlVFNlUV9qSHZuRGZSNC1EWTJDSGp0LWtPVmV2aF8xOW1fYjJ1eTdwd2s6RUpBdy1mNUR0N3gwV2tvcUgzdUEzT3hQYWZudzl2WHN4QjluVXRjc3J4U0J5TXVmR2k0anF5SVB0RjBaaTZyWmd4VjZIUzM0ZHhxNTkxR0I=',
  //     },
  //     body: 'grant_type=client_credentials',
  //   })
  //     .then(response => response.json())
  //     .then(async data => {
  //       pass(data);
  //     })
  //     .catch(function (error) {
  //       let edata = error.message;
  //       console.log('Error:', edata);
  //       fail(error);
  //     });
  // },

  // getStripeToken: (data, pass, fail) => {
  //   console.log('Getting', data);

  //   instance.interceptors.request.use(request => {
  //     console.log('Api Method', '=========POST=========');
  //     console.log('Starting Request', JSON.stringify(request));
  //     return request;
  //   });

  //   instance.interceptors.response.use(response => {
  //     console.log('Response:', JSON.stringify(response));
  //     return response;
  //   });

  //   var config = {
  //     method: 'post',
  //     url: 'https://api.stripe.com/v1/payment_intents',
  //     headers: {
  //       Authorization:
  //         'Bearer sk_test_51KgtdlIA85OQbiCgEtQVtuerSAVxHYLw3b70zGAKhRemf0NQAAk8mGSueVi3HxTRGPW7I6ZYQi2zPeGwVFUDSb6v003XrW19FQ',
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //       Accept: 'application/json',
  //     },
  //     data: data,
  //   };

  //   instance
  //     .post('payment_intents', data)
  //     // axios(config)
  //     .then(function (response) {
  //       pass(response.data);
  //     })
  //     .catch(function (error) {
  //       fail(error);
  //     });
  // },
};
