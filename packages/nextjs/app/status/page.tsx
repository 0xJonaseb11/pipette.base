const STATUS_PAGE_URL = process.env.NEXT_PUBLIC_STATUS_PAGE_URL;

export const metadata = {
  title: "Status",
  description: "Pipette service status",
};

export default function StatusPage() {
  if (!STATUS_PAGE_URL) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-base-200">
        <p className="text-base-content/70 text-sm">Status page is not configured.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full -m-4 sm:-m-0 bg-base-200">
      <iframe
        src={STATUS_PAGE_URL}
        title="Pipette status"
        className="w-full h-[calc(100vh-8rem)] min-h-[600px] border-0 rounded-xl"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
