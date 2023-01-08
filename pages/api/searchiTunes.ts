import { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (
    request.query.albumName === undefined ||
    request.query.artistName === undefined
  ) {
    return response.status(406).send(
      "Must have albumName and artistName in the query",
    );
  }
  const albumName = (request.query.albumName as string).toLowerCase()
    .replaceAll("(", "").replaceAll(")", "");
  const artistName = (request.query.artistName as string).toLowerCase();
  const searchTerm = (albumName + " " + artistName).replaceAll(
    " ",
    "+",
  );
  try {
    const iTunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${searchTerm}&media=music&explicit=Y&entity=album`,
    );
    const data = await iTunesResponse.json();

    if (
      data.results && data.results.length > 0
    ) {
      const result = data.results.find((a: any) =>
        albumName.split(" ").map((name) =>
          a.collectionName.replace(":", "").toLowerCase().includes(name)
        ).includes(true) &&
        a.artistName.toLowerCase().includes(artistName)
      );
      if (result) {
        const id = result.collectionId;
        return response.status(200).json({ id });
      }
    }
  } catch (e) {
    return response.status(500).json({ error: `Error ${e}` });
  }

  return response.status(204).json({
    response: "No id exists for the search term provided",
  });
}
