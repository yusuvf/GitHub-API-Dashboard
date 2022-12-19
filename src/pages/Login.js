import { useContext } from "react";
import { AuthContext } from "../App";
import { useEffect, useState } from "react";
import useSWRImmutable from "swr/immutable";
import fetchUser from "../fetchers/fetchUser";

export default function Login() {
  const { state, dispatch } = useContext(AuthContext);
  const [code, setCode] = useState(null);

  const { data, error, isLoading } = useSWRImmutable(
    code ? state.proxy_url : null,
    async () => await fetchUser(state.proxy_url, code, dispatch)
  );

  const { client_id, redirect_uri } = state;

  useEffect(() => {
    const url = window.location.href;
    const hasCode = url.includes("?code=");

    if (hasCode) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, null, newUrl[0]);

      setCode({
        code: newUrl[1],
      });
    }
  }, [state, dispatch, code]);

  return (
    <div className="flex h-screen justify-center items-center">
      <a
        href={`https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${redirect_uri}`}
        className="btn"
      >
        SignIn with GitHub
      </a>
    </div>
  );
}
