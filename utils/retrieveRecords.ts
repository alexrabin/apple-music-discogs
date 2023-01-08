import DiscogResponse from "../models/DiscogResponse";

const retrieveRecords = async (): Promise<DiscogResponse | null> => {
  try {
    const response = await fetch(
      `https://api.discogs.com/users/alexrabin/collection/folders/0/releases?token=${process.env.DISCOG_TOKEN}&per_page=100&sort=artist`,
    );

    const data = (await response.json()) as DiscogResponse;
    return data;
  } catch (e) {
    return null;
  }
};

export default retrieveRecords;
