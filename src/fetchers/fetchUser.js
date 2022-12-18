const fetchUser = async (url, code, dispatch) => {
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(code),
    });
    response = await response.json();
    if (response.login) {
      dispatch({
        type: "LOGIN",
        payload: { user: "data", isLoggedIn: true },
      });
    }
    return response;
  };

export default fetchUser;