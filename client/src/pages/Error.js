import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  return (
    <main id="error-page">
      <h1>Oops!</h1>
      <p>Désolé, une erreur inattendue s'est produite.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </main>
  );
}
