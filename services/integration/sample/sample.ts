export interface SampleIntegration {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function getSampleData(): Promise<SampleIntegration[]> {
  const response = await fetch(`${process.env.API_BASE_URL}/todos`);
  if (!response.ok) throw new Error("Failed to fetch sample data");
  return response.json();
}
