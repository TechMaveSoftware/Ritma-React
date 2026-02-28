const baseURL = 'https://techmavesoftwaredemo.com/wright_express/api/admin/';

export default {
  Post: (endpoint, data, pass, fail) => {
    try {
      console.log('Api Path', baseURL + endpoint);
      console.log('Api Post Data', JSON.stringify(data));

      fetch(baseURL + endpoint, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'multipart/form-data',
          Authorization:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkdmFueCIsImlhdCI6MTUxNjIzOTAyMn0.Tn_gxd7XwfEW7hoAMQqQkbkiAQD24FUSB9P90bSmPQQ',
        }),
        body: data,
      })
        .then(res => res.json())
        .then(responseJson => {
          console.log('imageUpload=>', responseJson);
          pass(responseJson);
        })
        .catch(error => {
          fail(error);
          //ERROR
          console.log('Catch 1 ERROR from uploading image to PHP....' + error);
        });
    } catch (error) {
      fail(error);
      console.log(
        'Catch 2 ERROR from uploading image to PHP....' + JSON.stringify(error),
      );
    }
  },
};
