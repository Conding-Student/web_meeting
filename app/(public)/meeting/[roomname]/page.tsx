import MeetingRoom from "./MeetingRoom";

type PageProps = {
  params: Promise<{
    roomName: string;
  }>;
};

export default async function MeetingPage({ params }: PageProps) {
  const { roomName } = await params;

  return <MeetingRoom roomName={decodeURIComponent(roomName)} />;
}