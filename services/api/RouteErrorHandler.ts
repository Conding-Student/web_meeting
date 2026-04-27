import { cookies } from "next/headers";
import { isApiError } from "./ApiHelper";

export async function handleApiError(error: unknown): Promise<Response> {
  if (isApiError(error)) {
    if (error.type === "session") {
      (await cookies()).delete("token");
      return Response.json(
        { message: error.message, retCode: "104" },
        { status: 401 },
      );
    }

    return Response.json(
      { message: error.message, retCode: error.retCode || "5000" },
      { status: error.statusCode || 500 },
    );
  }

  console.error("Unexpected Error:", error);
  return Response.json({ message: "Internal server error" }, { status: 500 });
}
