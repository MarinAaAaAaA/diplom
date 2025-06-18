import fetch from 'node-fetch';

export async function checkInnExists(inn) {
  const response = await fetch(
    'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Token ${process.env.DADATA_API_KEY}`,
      },
      body: JSON.stringify({ query: inn }),
    }
  );

  if (!response.ok) {
    throw new Error(`Dadata API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
    return null;
  }

  const org = data.suggestions[0].data;
  return org.state?.status === 'ACTIVE' ? org : null;
}