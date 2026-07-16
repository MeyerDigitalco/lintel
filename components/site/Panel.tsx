import { cn } from "@/lib/cn";

/**
 * Marketing surface. Separate from components/ui/Card on purpose: Card dresses
 * the dashboard and is used in roughly a hundred places, so it keeps the cool
 * app palette and the 12px radius. This one is warm and sharp.
 */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-edge border border-sepia bg-white", className)} {...props} />;
}

export function PanelBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}
