import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../App";
import fetchUser from "../fetchers/fetchUser";
import fetchRepos from "../fetchers/fetchRepos";
import RepositoriesTable from "../components/RepositoriesTable";
import useSWRImmutable from "swr/immutable";
import useSWR from "swr";

export default function Dashboard() {
  const { state, dispatch } = useContext(AuthContext);
  const [code, setCode] = useState(null);

  const { data, error, isLoading } = useSWRImmutable(
    code ? state.proxy_url : null,
    async () => await fetchUser(state.proxy_url, code, dispatch)
  );

  localStorage.setItem("token", data?.token);

  const token = localStorage.getItem("token");

  const {
    data: repos,
    error: reposError,
    isLoading: isReposLoading,
  } = useSWR(
    data
      ? `https://api.github.com/user/repos?q=visiblity:all`
      : null,
    async () =>
      await fetchRepos(
        `https://api.github.com/user/repos?q=visiblity:all`,
        token
      )
  );

  console.log(repos)

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

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-2xl font-bold">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">Error!</div>
    );

  if (data) {
    return (
      <div className="grid grid-flow-row-dense grid-cols-4 h-screen">
        <div className="col-span-1 bg-stone-500 flex flex-col items-center pt-12">
          <div className="pb-4">
            <img
              alt="img"
              className="rounded-full w-[140px]"
              src={data?.avatar_url}
            />
          </div>
          <div className="text-lg">
            <span className="font-bold">username:</span> {data?.login}
          </div>
          <div className="text-lg">
            <span className="font-bold">email:</span> {data?.email}
          </div>
          <div className="text-lg">
            <span className="font-bold">followers:</span> {data?.followers}
          </div>
          <div className="text-lg">
            <span className="font-bold">following:</span> {data?.following}
          </div>
        </div>
        <div className="col-span-3 bg-stone-300 pt-12">
          <div className="tabs pl-6 pt-6">
            <a className="tab tab-lifted tab-active">Overview Repositories</a>
          </div>
          <div className="px-6">
            <RepositoriesTable repos={repos} />
          </div>
        </div>
      </div>
    );
  }
}
