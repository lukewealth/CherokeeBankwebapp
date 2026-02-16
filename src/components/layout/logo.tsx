import Link from "next/link";
import Image from "next/image";

const SIZES = {
  xs:      { width: 14, height: 7 },
  small:   { width: 40, height: 20 },
  default: { width: 55, height: 28 },
  large:   { width: 80, height: 40 },
} as const;

export function CherokeeBankLogo({ size = "default" }: { size?: keyof typeof SIZES }) {
  const { width, height } = SIZES[size];

  return (
    <Link href="/dashboard">
      <Image
        src="/branding/logos/cherokee-logo.png"
        alt="Cherokee Digital"
        width={width}
        height={height}
        className="object-contain"
        style={{ width: 'auto', height: 'auto' }}
        priority
      />
    </Link>
  );
}
