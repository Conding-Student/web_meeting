import { getSampleData } from "@/services/integration/sample/sample";

export default async function Home() {
  const sampleData = await getSampleData();
  const userId = sampleData[0]?.userId;
  const id = sampleData[0]?.id;
  const title = sampleData[0]?.title;
  const completed = sampleData[0]?.completed;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-white font-sans">
      <main className="flex flex-col items-center justify-between py-2">
        <h1 className="text-2xl font-bold text-black">User ID: {userId}</h1>
        <h1 className="text-2xl font-bold text-black">ID: {id}</h1>
        <h1 className="text-2xl font-bold text-black">Title: {title}</h1>
        <h1 className="text-2xl font-bold text-black">
          Completed: {completed ? "Yes" : "No"}
        </h1>
      </main>
    </div>
  );
}
