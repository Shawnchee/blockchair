import { NextRequest, NextResponse } from "next/server";
import { getSSLDetails } from "@/utils/ssl-cert/SSLChecker";

export async function POST(req: NextRequest){
    try {
        const { url } = await req.json();

        const result = await getSSLDetails(url);
        console.log("SSL Details:", result);
        return NextResponse.json(result, {
            headers: {
              "Access-Control-Allow-Origin": "https://www.block-chair.tech", // Allow requests from your domain
              "Access-Control-Allow-Methods": "POST, OPTIONS", // Allow POST and OPTIONS methods
              "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
            },
          });
        } catch (error) {
          console.error("Error checking SSL", error);
          return NextResponse.json(
            { error: "Failed to check SSL" },
            {
              status: 500,
              headers: {
                "Access-Control-Allow-Origin": "https://www.block-chair.tech",
              },
            }
          );
        }
      }