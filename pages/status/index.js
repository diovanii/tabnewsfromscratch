import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status do Banco de dados</h1>
      <UpdatedAt />
      <DatabaseVersion />
      <DatabaseMaxConnections />
      <DatabaseOpenedConnections />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div>Última atualização: {updatedAtText}</div>;
}

function DatabaseVersion() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI);
  let databaseVersion;

  if (!isLoading && data) {
    databaseVersion = data.dependencies.database.version;
  }

  return <div>Versão: {databaseVersion}</div>;
}

function DatabaseMaxConnections() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI);
  let databaseMaxConnections;

  if (!isLoading && data) {
    databaseMaxConnections = data.dependencies.database.max_connections;
  }
  return <div>Quantidade máxima de conexões: {databaseMaxConnections}</div>;
}

function DatabaseOpenedConnections() {
  const { isLoading, data } = useSWR("api/v1/status", fetchAPI);
  let databaseOpenedConnections;

  if (!isLoading && data) {
    databaseOpenedConnections = data.dependencies.database.opened_connections;
  }
  return <div>Conexões ativas: {databaseOpenedConnections}</div>;
}
