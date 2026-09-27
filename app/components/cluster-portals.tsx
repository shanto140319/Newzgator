import type { TrendingCluster } from "../lib/articles";
import { NewsImage } from "./news-image";
import styles from "./cluster-news.module.css";

export function ClusterPortals({ portals }: { portals: TrendingCluster["sourcePortals"] }) {
  if (!portals.length) return null;
  return <ul className={`${styles.portals} ${styles.logoLine}`} aria-label="এই খবরের সংবাদমাধ্যম">{portals.slice(0, 5).map(portal => {
    const content = portal.portalLogo ? <NewsImage src={portal.portalLogo} alt={portal.portalName} width={64} height={22} hideOnError /> : <span>{portal.portalName}</span>;
    return <li key={portal.portalId}>{portal.portalUrl ? <a className={styles.portal} title={portal.portalName} aria-label={portal.portalName} href={portal.portalUrl} target="_blank" rel="noopener noreferrer">{content}</a> : <span className={styles.portal}>{content}</span>}</li>;
  })}</ul>;
}
