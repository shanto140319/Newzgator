import { useTranslations } from "next-intl";
import type { TrendingCluster } from "../lib/articles";
import styles from "./cluster-news.module.css";

export function ClusterPortals({ portals }: { portals: TrendingCluster["sourcePortals"] }) {
  const t = useTranslations();

  if (!portals.length) return null;
  return <ul className={`${styles.portals} ${styles.logoLine}`} aria-label={t("publishersCoveringThisStory")}>{portals.slice(0, 5).map(portal => {
    const content = <span>{portal.portalName}</span>;
    return <li key={portal.portalId}>{portal.portalUrl ? <a className={styles.portal} title={portal.portalName} aria-label={portal.portalName} href={portal.portalUrl} target="_blank" rel="noopener noreferrer">{content}</a> : <span className={styles.portal}>{content}</span>}</li>;
  })}</ul>;
}
