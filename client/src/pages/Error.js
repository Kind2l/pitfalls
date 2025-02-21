import BackButton from "@Components/BackButton";
import Header from "@Components/Header";
import ImageLoader from "@Components/ImageLoader";
import "@Styles/Error.scss";

import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <Header />
      <main className="error-page">
        <ImageLoader name={`cards/zonedecontrole`} />

        <h1>Halte, citoyen ! 🚔</h1>
        <p>
          Cette page est une zone interdite... ou peut-être qu'elle n'existe pas
          !
        </p>
        <p>Erreur : {error?.statusText || error?.message || "404 Not Found"}</p>
        <BackButton />
      </main>
    </>
  );
}
