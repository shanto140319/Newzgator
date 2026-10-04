import logo from "../../public/brand/newsgator-logo-english-v1.png";

/** Preserve the transparent artwork while coloring it for the active theme. */
export function BrandLogo() {
  return <span className="brand-logo brand-mark" role="img" aria-label="NewsGator" style={{ maskImage: `url(${logo.src})`, WebkitMaskImage: `url(${logo.src})`, aspectRatio: `${logo.width} / ${logo.height}` }} />;
}
