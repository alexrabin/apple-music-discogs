import { GetServerSideProps } from "next";
import React from "react";
import DiscogRecord from "../models/DiscogRecord";
import retrieveRecords from "../utils/retrieveRecords";
import styles from "../styles/Home.module.css";
import Image from "next/image";

interface PageProps {
  album: DiscogRecord;
  appleMusicId: string;
}
const AlbumPage = ({ album, appleMusicId }: PageProps) => {
  return (
    <div>
      <main className={styles.main}>
        <div className={styles.card}>
          <h2>
            {album.basic_information.title} -{" "}
            {album.basic_information.artists[0].name}
          </h2>
          <div className={styles.imageContainer}>
            <Image
              src={album.basic_information.cover_image}
              alt={album.basic_information.title}
              fill
              priority
            />
          </div>
        </div>
        <div>
          <iframe
            allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
            frameBorder="0"
            height="450"
            style={{
              width: "100%",
              overflow: "hidden",
              background: "transparent",
              borderRadius: "15px",
            }}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            src={`https://embed.music.apple.com/us/album/${appleMusicId}`}
          ></iframe>
        </div>
      </main>
    </div>
  );
};

export default AlbumPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=20, stale-while-revalidate=59"
  );
  try {
    const { albumId } = context.params || {};
    if (!albumId || typeof albumId !== "string") {
      throw new Error("No albumId present");
    }
    const data = await retrieveRecords();
    if (!data || data.releases.length <= 0) {
      throw new Error("No records found");
    }

    const album = data.releases.find((a) => a.id === parseInt(albumId));
    if (!album) {
      throw new Error("No album found with the given id");
    }
    const albumName = album.basic_information.title.toLowerCase();
    const artistName = album.basic_information.artists[0].name.toLowerCase();
    const searchTerm = (albumName + " " + artistName).replaceAll(" ", "+");

    const iTunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${searchTerm}&media=music&explicit=Y&entity=album`
    );
    const iTunesData = await iTunesResponse.json();

    if (!iTunesData.results || iTunesData.results.length < 0) {
      throw new Error("No apple music id found");
    }
    const result = iTunesData.results.find(
      (a: any) =>
        albumName
          .split(" ")
          .map((name) =>
            a.collectionName.replace(":", "").toLowerCase().includes(name)
          )
          .includes(true) && a.artistName.toLowerCase().includes(artistName)
    );
    if (!result) {
      throw new Error("No apple music id found");
    }
    return {
      props: {
        album,
        appleMusicId: result.collectionId,
      },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }
};
