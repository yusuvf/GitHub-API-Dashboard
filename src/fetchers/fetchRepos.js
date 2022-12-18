const fetchRepos = async (url, access_token) => {
    let response = await fetch(url, {
      headers: {
        Authorization: `token ${access_token}`,
      },
    });
    return await response.json();
  };

export default fetchRepos;