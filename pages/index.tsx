import { GetStaticProps } from "next";
import Image from "next/image";
import DiscogRecord from "../models/DiscogRecord";
import styles from "../styles/Home.module.css";
import retrieveRecords from "../utils/retrieveRecords";

interface PageProps {
  records: DiscogRecord[];
}

export default function Home({ records }: PageProps) {
  return (
    <div>
      <main className={styles.main}>
        <div className={styles.grid}>
          {records.map((record, i) => {
            return (
              <a key={i} className={styles.card} href={`/${record.id}`}>
                <h2>
                  {record.basic_information.title} -{" "}
                  {record.basic_information.artists[0].name}
                </h2>
                <div className={styles.imageContainer}>
                  <Image
                    src={record.basic_information.cover_image}
                    alt={record.basic_information.title}
                    fill
                    priority
                  />
                </div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const data = await retrieveRecords();
    if (!data) {
      throw new Error("No records found");
    }
    return {
      props: {
        records: data.releases,
      },
    };
  } catch (error) {
    return {
      props: {
        error,
      },
    };
  }
};
