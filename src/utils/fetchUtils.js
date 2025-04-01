// fetchUtils.js
export class Fetcher {
  async fetchData(endpoint, options = {}) {
    const headers = new Headers();
    headers.set(
      "Authorization",
      "Basic " +
        btoa(import.meta.env.CLIENT_KEY + ":" + import.meta.env.CLIENT_SECRET),
    );

    const defaultOptions = {
      method: "GET",
      headers: headers,
    };

    const response = await fetch(import.meta.env.API_URL + endpoint, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}
