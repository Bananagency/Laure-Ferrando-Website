// fetchUtils.js
const clientKey = import.meta.env.PUBLIC_CLIENT_KEY;
const clientSecret = import.meta.env.PUBLIC_CLIENT_SECRET;
const apiUrl = import.meta.env.PUBLIC_API_URL;

export class Fetcher {
  async fetchData(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set(
      "Authorization",
      "Basic " + btoa(clientKey + ":" + clientSecret)
    );
    headers.set("Content-Type", "application/json");

    const defaultOptions = {
      method: "GET",
      headers: headers,
    };

    // Normalisation de l'URL pour éviter les doublons de slash
    let baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;

    const response = await fetch(baseUrl + cleanEndpoint, {
      ...defaultOptions,
      ...options,
      headers: headers
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 401) {
        return response;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
