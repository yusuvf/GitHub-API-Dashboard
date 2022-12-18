import { useContext } from "react";
import { AuthContext } from "../App";

export default function Login() {
  const { state, dispatch } = useContext(AuthContext);

  const { client_id, redirect_uri } = state;

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
