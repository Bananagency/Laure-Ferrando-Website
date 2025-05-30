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

    const response = await fetch(apiUrl + endpoint, {
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
